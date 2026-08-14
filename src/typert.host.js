import { z } from 'zod'

const sessionIdSchema = z.string().min(1)
const restoreResultSchema = z.object({
  restored: z.boolean(),
  archivedSessionIds: z.array(z.string()),
})

export const TYPERT = {
  package: 'dsh-archived-sessions',
  face: 'host',
  schemas: [],
  invocations: [
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
  model: {
    services: [],
    events: [],
    objects: [],
  },
}

export default TYPERT
