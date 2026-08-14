function sessionId(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError('sessionId must be a non-empty string')
  }
  return value
}

function restoreResult(value) {
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
}

export const TYPERT_REMOTE = {
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
            schema: { parse: sessionId },
          },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-archived-sessions/types#RestoreResult',
        schema: { parse: restoreResult },
      },
    },
  ],
}

export default TYPERT_REMOTE
