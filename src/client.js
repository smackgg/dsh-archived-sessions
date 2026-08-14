window.__ModuleLoader__.load({
  id: 'dsh-archived-sessions',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const { Fragment, jsx, jsxs } = require('react/jsx-runtime')
    const { useEffect, useMemo, useState } = require('react')
    const {
      Button,
      IconChevronDownOutline14,
      Menu,
      Modal,
    } = require('@deepseek-ai/dsh-client-ui-primitives')
    const { bindSnapshotSelector } = require('@deepseek-ai/dsh-client-web-react')

    const NS = 'settings.archivedSessions'
    const STYLE_ID = 'dsh-archived-sessions'
    const ALL_PROJECTS = '*'
    const UNGROUPED_PROJECT = 'ungrouped'
    const inject = ['remote']

    const sessionIdSchema = {
      parse(value) {
        if (typeof value !== 'string' || value.length === 0) {
          throw new TypeError('sessionId must be a non-empty string')
        }
        return value
      },
    }

    const restoreResultSchema = {
      parse(value) {
        if (
          typeof value !== 'object'
          || value === null
          || typeof value.restored !== 'boolean'
          || !Array.isArray(value.archivedSessionIds)
          || !value.archivedSessionIds.every((id) => typeof id === 'string')
        ) {
          throw new TypeError('invalid archived session restore result')
        }
        return value
      },
    }

    const TYPERT_REMOTE = {
      package: 'dsh-archived-sessions',
      descriptors: [
        {
          id: 'dsh-archived-sessions#archivedSessions/restore',
          service: 'archivedSessions',
          namespace: 'archivedSessions',
          method: 'restore',
          invocation: { kind: 'direct' },
          parameters: [
            {
              name: 'sessionId',
              wire: 'sessionId',
              source: 'json',
              codec: {
                mode: 'strict',
                typeSymbol: 'dsh-archived-sessions/types#SessionId',
                schema: sessionIdSchema,
              },
            },
          ],
          result: {
            mode: 'strict',
            typeSymbol: 'dsh-archived-sessions/types#RestoreResult',
            schema: restoreResultSchema,
          },
        },
      ],
    }

    const css = `
      .dhd-archived-section {
        box-sizing: border-box;
        display: flex;
        width: 100%;
        flex-direction: column;
        gap: 16px;
        padding-top: 4px;
      }

      .dhd-archived-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .dhd-archived-heading-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 4px;
      }

      .dhd-archived-title {
        margin: 0;
        color: var(--dsw-alias-label-primary);
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
      }

      .dhd-archived-description,
      .dhd-archived-empty,
      .dhd-archived-meta,
      .dhd-archived-group-count {
        margin: 0;
        color: var(--dsw-alias-label-secondary);
        font-size: 12px;
        line-height: 18px;
      }

      .dhd-archived-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .dhd-archived-search,
      .dhd-archived-project-trigger {
        box-sizing: border-box;
        height: 36px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 10px;
        outline: none;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 13px;
      }

      .dhd-archived-search {
        min-width: 0;
        flex: 1;
        padding: 0 12px;
      }

      .dhd-archived-search::placeholder {
        color: var(--dsw-alias-label-secondary);
      }

      .dhd-archived-project-menu {
        display: block;
        width: min(220px, 38%);
        flex: none;
      }

      .dhd-archived-project-trigger {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 10px 0 12px;
        cursor: pointer;
        text-align: left;
      }

      .dhd-archived-project-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dhd-archived-project-chevron {
        flex: none;
        transition: transform 120ms ease;
      }

      .dhd-archived-project-chevron-open {
        transform: rotate(180deg);
      }

      .dhd-archived-search:focus,
      .dhd-archived-project-trigger:focus-visible {
        border-color: var(--dsw-alias-label-secondary);
      }

      .dhd-archived-groups,
      .dhd-archived-group {
        display: flex;
        flex-direction: column;
      }

      .dhd-archived-groups {
        gap: 18px;
      }

      .dhd-archived-group {
        gap: 8px;
      }

      .dhd-archived-group-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 2px;
      }

      .dhd-archived-group-title {
        overflow: hidden;
        margin: 0;
        color: var(--dsw-alias-label-primary);
        font-size: 13px;
        font-weight: 600;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dhd-archived-list {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 12px;
      }

      .dhd-archived-row {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--dsw-alias-border-l2);
      }

      .dhd-archived-row:last-child {
        border-bottom: none;
      }

      .dhd-archived-copy {
        display: flex;
        min-width: 0;
        flex: 1;
        flex-direction: column;
        gap: 2px;
      }

      .dhd-archived-name {
        overflow: hidden;
        color: var(--dsw-alias-label-primary);
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dhd-archived-empty {
        padding: 28px 16px;
        text-align: center;
      }

      .dhd-archived-actions {
        display: flex;
        flex: none;
        align-items: center;
        gap: 8px;
      }

      .dhd-archived-delete {
        border: none;
        border-radius: 8px;
        padding: 6px 8px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        font: inherit;
        font-size: 12px;
        line-height: 18px;
      }

      .dhd-archived-delete:hover {
        color: #f05252;
      }

      .dhd-archived-delete-all {
        flex: none;
        color: #f05252;
      }

      @media (max-width: 640px) {
        .dhd-archived-heading,
        .dhd-archived-toolbar,
        .dhd-archived-row {
          align-items: stretch;
          flex-direction: column;
        }

        .dhd-archived-project-menu {
          width: 100%;
        }

        .dhd-archived-actions {
          justify-content: flex-end;
        }
      }
    `

    if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) === null) {
      const tag = document.createElement('style')
      tag.dataset.plugin = STYLE_ID
      tag.dataset.pluginCss = STYLE_ID
      tag.textContent = css
      document.head.appendChild(tag)
    }

    const zh = {
      nav: '已归档',
      title: '已归档会话',
      description: '这些会话仍保留在本地。你可以搜索、按项目筛选或取消归档。',
      empty: '暂无已归档会话',
      emptyFiltered: '没有匹配的已归档会话',
      ungrouped: '未分组',
      unavailableTime: '时间未知',
      searchPlaceholder: '搜索已归档会话',
      searchAria: '搜索已归档会话',
      projectFilterAria: '按项目筛选',
      allProjects: '所有项目',
      groupCountOne: '1 个会话',
      groupCount: '{count} 个会话',
      cancel: '取消归档',
      cancelAria: '取消归档 {name}',
      restoring: '恢复中…',
      delete: '删除',
      deleteAria: '删除 {name}',
      deleteAll: '全部删除',
      deleteUnavailableTitle: '暂不支持永久删除',
      deleteUnavailableDescription: 'DeepSeek Harness 当前没有提供安全的会话删除 API。插件不会直接删除底层文件，以免损坏会话索引或历史；该入口将在官方 API 可用后启用。',
      restoreFailedTitle: '取消归档失败',
      restoreFailedDescription: '插件无法更新归档状态，请重试。',
      close: '关闭',
    }

    const en = {
      nav: 'Archived',
      title: 'Archived sessions',
      description: 'These sessions remain stored locally. Search, filter by project, or unarchive them here.',
      empty: 'No archived sessions',
      emptyFiltered: 'No archived sessions match your filters',
      ungrouped: 'Ungrouped',
      unavailableTime: 'Time unavailable',
      searchPlaceholder: 'Search archived sessions',
      searchAria: 'Search archived sessions',
      projectFilterAria: 'Filter by project',
      allProjects: 'All projects',
      groupCountOne: '1 session',
      groupCount: '{count} sessions',
      cancel: 'Unarchive',
      cancelAria: 'Unarchive {name}',
      restoring: 'Restoring…',
      delete: 'Delete',
      deleteAria: 'Delete {name}',
      deleteAll: 'Delete all',
      deleteUnavailableTitle: 'Permanent deletion is not available yet',
      deleteUnavailableDescription: 'DeepSeek Harness does not currently expose a safe session deletion API. This plugin will not delete storage files directly because that could corrupt session indexes or history. This action will be enabled when an official API is available.',
      restoreFailedTitle: 'Could not unarchive session',
      restoreFailedDescription: 'The plugin could not update the archive state. Please try again.',
      close: 'Close',
    }

    function workspaceForSession(sessionId, workspaces, fallback) {
      const workspace = workspaces.find((candidate) => candidate.sessionIds.includes(sessionId))
      return workspace === undefined
        ? { key: UNGROUPED_PROJECT, id: null, title: fallback }
        : { key: `workspace:${workspace.workspaceId}`, id: workspace.workspaceId, title: workspace.title }
    }

    function formatUpdatedAt(updatedAt, fallback) {
      if (!Number.isFinite(updatedAt)) return fallback
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(updatedAt))
    }

    function buildArchivedRows(archivedSessionIds, sessionsById, workspaces, fallbackWorkspace, fallbackTime) {
      return [...archivedSessionIds].reverse().map((sessionId) => {
        const session = sessionsById[sessionId]
        const workspace = workspaceForSession(sessionId, workspaces, fallbackWorkspace)
        return {
          id: sessionId,
          name: session?.displayTitle ?? sessionId,
          workspaceKey: workspace.key,
          workspaceId: workspace.id,
          workspace: workspace.title,
          updatedAt: formatUpdatedAt(session?.updatedAt, fallbackTime),
        }
      })
    }

    function filterArchivedRows(rows, query, projectKey) {
      const needle = query.trim().toLocaleLowerCase()
      return rows.filter((row) => {
        if (projectKey !== ALL_PROJECTS && row.workspaceKey !== projectKey) return false
        if (needle.length === 0) return true
        return `${row.name}\n${row.workspace}\n${row.id}`.toLocaleLowerCase().includes(needle)
      })
    }

    function groupArchivedRows(rows) {
      const groups = []
      const byKey = new Map()
      for (const row of rows) {
        let group = byKey.get(row.workspaceKey)
        if (group === undefined) {
          group = { key: row.workspaceKey, title: row.workspace, rows: [] }
          byKey.set(row.workspaceKey, group)
          groups.push(group)
        }
        group.rows.push(row)
      }
      return groups
    }

    function listArchivedProjects(rows) {
      const projects = []
      const seen = new Set()
      for (const row of rows) {
        if (seen.has(row.workspaceKey)) continue
        seen.add(row.workspaceKey)
        projects.push({ key: row.workspaceKey, title: row.workspace })
      }
      return projects
    }

    function ArchivedSessionsSection({ restore, useSessions, useWorkspaces, t }) {
      const archivedSessionIds = useWorkspaces((state) => state.archivedSessionIds)
      const workspaces = useWorkspaces((state) => state.items)
      const sessionsById = useSessions((state) => state.byId)
      const [restoringId, setRestoringId] = useState(null)
      const [restoreError, setRestoreError] = useState(null)
      const [searchQuery, setSearchQuery] = useState('')
      const [projectKey, setProjectKey] = useState(ALL_PROJECTS)
      const [projectMenuOpen, setProjectMenuOpen] = useState(false)
      const [deleteNoticeOpen, setDeleteNoticeOpen] = useState(false)

      const rows = useMemo(() => buildArchivedRows(
        archivedSessionIds,
        sessionsById,
        workspaces,
        t('ungrouped'),
        t('unavailableTime'),
      ), [archivedSessionIds, sessionsById, t, workspaces])
      const projects = useMemo(() => listArchivedProjects(rows), [rows])
      useEffect(() => {
        if (projectKey !== ALL_PROJECTS && !projects.some((project) => project.key === projectKey)) {
          setProjectKey(ALL_PROJECTS)
        }
      }, [projectKey, projects])
      const filteredRows = useMemo(
        () => filterArchivedRows(rows, searchQuery, projectKey),
        [projectKey, rows, searchQuery],
      )
      const groups = useMemo(() => groupArchivedRows(filteredRows), [filteredRows])
      const projectMenuItems = useMemo(() => [
        { id: ALL_PROJECTS, label: t('allProjects') },
        ...projects.map((project) => ({ id: project.key, label: project.title })),
      ], [projects, t])
      const selectedProjectLabel = projectKey === ALL_PROJECTS
        ? t('allProjects')
        : projects.find((project) => project.key === projectKey)?.title ?? t('allProjects')

      return jsxs(Fragment, {
        children: [
          jsxs('section', {
            className: 'dhd-archived-section',
            children: [
              jsxs('div', {
                className: 'dhd-archived-heading',
                children: [
                  jsxs('div', {
                    className: 'dhd-archived-heading-copy',
                    children: [
                      jsx('h2', { className: 'dhd-archived-title', children: t('title') }),
                      jsx('p', { className: 'dhd-archived-description', children: t('description') }),
                    ],
                  }),
                  rows.length === 0 ? null : jsx('button', {
                    type: 'button',
                    className: 'dhd-archived-delete dhd-archived-delete-all',
                    onClick: () => setDeleteNoticeOpen(true),
                    children: t('deleteAll'),
                  }),
                ],
              }),
              rows.length === 0
                ? jsx('div', { className: 'dhd-archived-empty', children: t('empty') })
                : jsxs(Fragment, {
                    children: [
                      jsxs('div', {
                        className: 'dhd-archived-toolbar',
                        children: [
                          jsx('input', {
                            type: 'search',
                            className: 'dhd-archived-search',
                            value: searchQuery,
                            placeholder: t('searchPlaceholder'),
                            'aria-label': t('searchAria'),
                            onChange: (event) => setSearchQuery(event.currentTarget.value),
                          }),
                          jsx(Menu, {
                            className: 'dhd-archived-project-menu',
                            open: projectMenuOpen,
                            onClose: () => setProjectMenuOpen(false),
                            items: projectMenuItems,
                            selectedId: projectKey,
                            onSelect: (id) => {
                              setProjectKey(id)
                              setProjectMenuOpen(false)
                            },
                            align: 'end',
                            portal: true,
                            dense: true,
                            anchor: jsxs('button', {
                              type: 'button',
                              className: 'dhd-archived-project-trigger',
                              'aria-label': t('projectFilterAria'),
                              'aria-haspopup': 'menu',
                              'aria-expanded': projectMenuOpen,
                              onClick: () => setProjectMenuOpen((open) => !open),
                              children: [
                                jsx('span', {
                                  className: 'dhd-archived-project-label',
                                  children: selectedProjectLabel,
                                }),
                                jsx(IconChevronDownOutline14, {
                                  className: projectMenuOpen
                                    ? 'dhd-archived-project-chevron dhd-archived-project-chevron-open'
                                    : 'dhd-archived-project-chevron',
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      filteredRows.length === 0
                        ? jsx('div', { className: 'dhd-archived-empty', children: t('emptyFiltered') })
                        : jsx('div', {
                            className: 'dhd-archived-groups',
                            children: groups.map((group) => jsxs('section', {
                              className: 'dhd-archived-group',
                              children: [
                                jsxs('div', {
                                  className: 'dhd-archived-group-heading',
                                  children: [
                                    jsx('h3', { className: 'dhd-archived-group-title', children: group.title }),
                                    jsx('span', {
                                      className: 'dhd-archived-group-count',
                                      children: group.rows.length === 1
                                        ? t('groupCountOne')
                                        : t('groupCount', { count: group.rows.length }),
                                    }),
                                  ],
                                }),
                                jsx('div', {
                                  className: 'dhd-archived-list',
                                  children: group.rows.map((row) => jsxs('div', {
                                    className: 'dhd-archived-row',
                                    children: [
                                      jsxs('div', {
                                        className: 'dhd-archived-copy',
                                        children: [
                                          jsx('div', { className: 'dhd-archived-name', title: row.name, children: row.name }),
                                          jsx('div', { className: 'dhd-archived-meta', children: row.updatedAt }),
                                        ],
                                      }),
                                      jsxs('div', {
                                        className: 'dhd-archived-actions',
                                        children: [
                                          jsx('button', {
                                            type: 'button',
                                            className: 'dhd-archived-delete',
                                            'aria-label': t('deleteAria', { name: row.name }),
                                            onClick: () => setDeleteNoticeOpen(true),
                                            children: t('delete'),
                                          }),
                                          jsx(Button, {
                                            variant: 'outline',
                                            size: 'sm',
                                            disabled: restoringId !== null,
                                            'aria-label': t('cancelAria', { name: row.name }),
                                            onClick: async () => {
                                              setRestoringId(row.id)
                                              try {
                                                await restore(row.id)
                                              } catch (error) {
                                                setRestoreError(error instanceof Error ? error.message : String(error))
                                              } finally {
                                                setRestoringId(null)
                                              }
                                            },
                                            children: restoringId === row.id ? t('restoring') : t('cancel'),
                                          }),
                                        ],
                                      }),
                                    ],
                                  }, row.id)),
                                }),
                              ],
                            }, group.key)),
                          }),
                    ],
                  }),
            ],
          }),
          jsx(Modal, {
            open: deleteNoticeOpen,
            onClose: () => setDeleteNoticeOpen(false),
            closeLabel: t('close'),
            title: t('deleteUnavailableTitle'),
            description: t('deleteUnavailableDescription'),
            footer: jsx(Button, {
              variant: 'primary',
              onClick: () => setDeleteNoticeOpen(false),
              children: t('close'),
            }),
          }),
          jsx(Modal, {
            open: restoreError !== null,
            onClose: () => setRestoreError(null),
            closeLabel: t('close'),
            title: t('restoreFailedTitle'),
            description: restoreError === null
              ? t('restoreFailedDescription')
              : `${t('restoreFailedDescription')} (${restoreError})`,
            footer: jsx(Button, {
              variant: 'primary',
              onClick: () => setRestoreError(null),
              children: t('close'),
            }),
          }),
        ],
      })
    }

    function installArchivedSessionsUi(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'desktop-archived-sessions: dictionaries')
      const t = ctx.locale.bind(NS)
      const useSessions = bindSnapshotSelector(ctx.sessions.list)
      const useWorkspaces = bindSnapshotSelector(ctx.workspaces.list)
      const restore = async (sessionId) => {
        const result = await ctx.remote.archivedSessions.restore(sessionId)
        if (!result.ok) {
          throw new Error(`${result.error.code}: ${result.error.message}`)
        }
        return result.value
      }

      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'archived-sessions',
        order: 30,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ restore, useSessions, useWorkspaces, t }),
      }, ArchivedSessionsSection))
    }

    async function apply(ctx) {
      const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE)
      ctx.inject(
        ['slots', 'locale', 'remote.archivedSessions', 'sessions', 'workspaces'],
        installArchivedSessionsUi,
      )
      return disposeRemote
    }

    exports.NS = NS
    exports.ALL_PROJECTS = ALL_PROJECTS
    exports.UNGROUPED_PROJECT = UNGROUPED_PROJECT
    exports.buildArchivedRows = buildArchivedRows
    exports.filterArchivedRows = filterArchivedRows
    exports.groupArchivedRows = groupArchivedRows
    exports.listArchivedProjects = listArchivedProjects
    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
