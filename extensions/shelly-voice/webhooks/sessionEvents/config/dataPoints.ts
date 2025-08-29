import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  eventType: { key: 'eventType', valueType: 'string' },
  sessionId: { key: 'sessionId', valueType: 'string' },
  agentId: { key: 'agentId', valueType: 'string' },
  timestamp: { key: 'timestamp', valueType: 'string' },
  details: { key: 'details', valueType: 'json' },
} satisfies Record<string, DataPointDefinition>
