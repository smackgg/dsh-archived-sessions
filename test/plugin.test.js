import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'
import { WorkspaceRegistry } from '@deepseek-ai/dsh-workspace'
import { restoreArchivedSession } from '../src/index.js'
import { TYPERT } from '../src/typert.host.js'
import { TYPERT_REMOTE } from '../src/typert.remote-client.js'

const clientUrl = new URL('../src/client.js', import.meta.url)
const manifestUrl = new URL('../package.json', import.meta.url)
const patchUrl = new URL('../cordis.patch.yml', import.meta.url)
const plain = (value) => JSON.parse(JSON.stringify(value))

async function loadClientExports() {
  const source = await readFile(clientUrl, 'utf8')
  let definition
  vm.runInNewContext(source, {
    window: {
      __ModuleLoader__: {
        load(value) {
          definition = value
        },
      },
    },
  })

  assert.ok(definition)
  return definition.factory((id) => {
    if (id === 'react/jsx-runtime') return { Fragment: Symbol('Fragment'), jsx() {}, jsxs() {} }
    if (id === 'react') return { useEffect() {}, useMemo() {}, useState() {} }
    if (id === '@deepseek-ai/dsh-client-ui-primitives') {
      return { Button() {}, IconChevronDownOutline14() {}, Menu() {}, Modal() {} }
    }
    if (id === '@deepseek-ai/dsh-client-web-react') return { bindSnapshotSelector() {} }
    throw new Error(`Unexpected client module: ${id}`)
  })
}

test('package exposes an installable DSH bundle and Web client', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'))
  const patch = await readFile(patchUrl, 'utf8')

  assert.equal(manifest.name, 'dsh-archived-sessions')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.exports['./client'], './src/client.js')
  assert.match(patch, /id:\s*ui-archived-sessions/)
  assert.match(patch, /name:\s*'dsh-archived-sessions'/)
})

test('client mounts the restore Remote inside an explicitly injected consumer', async () => {
  const client = await readFile(clientUrl, 'utf8')

  assert.match(client, /id:\s*'archived-sessions'/)
  assert.match(client, /cancel:\s*'取消归档'/)
  assert.match(client, /ctx\.remote\.archivedSessions\.restore\(sessionId\)/)
  assert.match(client, /ctx\.remote\.\$mount\(TYPERT_REMOTE\)/)
  assert.match(client, /ctx\.inject\([\s\S]*'remote\.archivedSessions'/)
  assert.doesNotMatch(client, /尚未提供公开的恢复归档 API/)
})

test('client view model searches archived sessions and filters projects', async () => {
  const client = await loadClientExports()
  const rows = client.buildArchivedRows(
    ['session-1', 'session-2', 'session-3'],
    {
      'session-1': { displayTitle: 'Fix login', updatedAt: 1_700_000_000_000 },
      'session-2': { displayTitle: 'Release notes', updatedAt: 1_700_000_000_100 },
      'session-3': { displayTitle: 'Orphan task', updatedAt: 1_700_000_000_200 },
    },
    [
      { workspaceId: 'alpha', title: 'Alpha', sessionIds: ['session-1'] },
      { workspaceId: 'beta', title: 'Beta', sessionIds: ['session-2'] },
    ],
    'Ungrouped',
    'Time unavailable',
  )

  assert.deepEqual(plain(rows.map((row) => row.id)), ['session-3', 'session-2', 'session-1'])
  assert.deepEqual(
    plain(client.filterArchivedRows(rows, 'release', client.ALL_PROJECTS).map((row) => row.id)),
    ['session-2'],
  )
  assert.deepEqual(
    plain(client.filterArchivedRows(rows, '', 'workspace:alpha').map((row) => row.id)),
    ['session-1'],
  )
  assert.deepEqual(
    plain(client.filterArchivedRows(rows, 'ungrouped', client.ALL_PROJECTS).map((row) => row.id)),
    ['session-3'],
  )
})

test('client view model groups archived sessions and lists each project once', async () => {
  const client = await loadClientExports()
  const rows = [
    { id: 'session-1', workspaceKey: 'workspace:alpha', workspace: 'Alpha' },
    { id: 'session-2', workspaceKey: 'workspace:alpha', workspace: 'Alpha' },
    { id: 'session-3', workspaceKey: client.UNGROUPED_PROJECT, workspace: 'Ungrouped' },
  ]

  const groups = client.groupArchivedRows(rows)
  const projects = client.listArchivedProjects(rows)

  assert.deepEqual(plain(groups.map((group) => [group.key, group.rows.map((row) => row.id)])), [
    ['workspace:alpha', ['session-1', 'session-2']],
    [client.UNGROUPED_PROJECT, ['session-3']],
  ])
  assert.deepEqual(plain(projects.map((project) => project.key)), ['workspace:alpha', client.UNGROUPED_PROJECT])
})

test('delete controls disclose the missing safe Harness API', async () => {
  const client = await readFile(clientUrl, 'utf8')

  assert.match(client, /deleteAll:\s*'全部删除'/)
  assert.match(client, /DeepSeek Harness 当前没有提供安全的会话删除 API/)
  assert.doesNotMatch(client, /unlink\(|rmSync|removeSession|deleteSession/)
})

test('project filter uses the themed Harness menu instead of a native select', async () => {
  const client = await readFile(clientUrl, 'utf8')

  assert.match(client, /const \{[\s\S]*Menu,[\s\S]*\} = require\('@deepseek-ai\/dsh-client-ui-primitives'\)/)
  assert.match(client, /selectedId:\s*projectKey/)
  assert.match(client, /'aria-haspopup':\s*'menu'/)
  assert.doesNotMatch(client, /jsx\('select'/)
})

test('Host and Client publish matching strict restore descriptors', () => {
  const host = TYPERT.invocations[0]
  const client = TYPERT_REMOTE.descriptors[0]

  assert.equal(host.id, client.id)
  assert.equal(host.service, 'archivedSessions')
  assert.equal(host.namespace, client.namespace)
  assert.equal(host.method, 'restore')
  assert.equal(host.parameters[0].wire, 'sessionId')
  assert.equal(host.parameters[0].codec.mode, 'strict')
  assert.equal(client.result.mode, 'strict')
})

test('pinned Harness exposes the workspace state hooks used by restore', () => {
  assert.equal(typeof WorkspaceRegistry.prototype.requireState, 'function')
  assert.equal(typeof WorkspaceRegistry.prototype.setState, 'function')
  assert.equal(typeof WorkspaceRegistry.prototype.enqueueOperation, 'function')
})

test('restore removes only the requested archived session and preserves registry state', async () => {
  const initial = {
    initialized: true,
    workspaceIds: ['workspace-1'],
    archivedSessionIds: ['session-1', 'session-2'],
  }
  let state = initial
  let writes = 0
  const registry = {
    requireState: () => state,
    setState: async (next) => {
      writes += 1
      state = next
    },
    enqueueOperation: (operation) => operation(),
  }

  const result = await restoreArchivedSession(registry, 'session-1')

  assert.deepEqual(result, { restored: true, archivedSessionIds: ['session-2'] })
  assert.deepEqual(state, {
    initialized: true,
    workspaceIds: ['workspace-1'],
    archivedSessionIds: ['session-2'],
  })
  assert.equal(writes, 1)
  assert.deepEqual(initial.archivedSessionIds, ['session-1', 'session-2'])
})

test('restore is idempotent when the session is not archived', async () => {
  const state = { initialized: true, workspaceIds: [], archivedSessionIds: ['session-2'] }
  let writes = 0
  const registry = {
    requireState: () => state,
    setState: async () => { writes += 1 },
    enqueueOperation: (operation) => operation(),
  }

  const result = await restoreArchivedSession(registry, 'session-1')

  assert.deepEqual(result, { restored: false, archivedSessionIds: ['session-2'] })
  assert.equal(writes, 0)
})
