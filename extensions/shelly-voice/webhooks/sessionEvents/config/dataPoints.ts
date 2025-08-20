import { DataPointDefinition, DataPointValueType } from '@awell-health/extensions-core'

export const dataPoints = {
  eventType: { key: 'eventType', valueType: DataPointValueType.STRING },
  sessionId: { key: 'sessionId', valueType: DataPointValueType.STRING },
  agentId: { key: 'agentId', valueType: DataPointValueType.STRING },
  timestamp: { key: 'timestamp', valueType: DataPointValueType.STRING },
  details: { key: 'details', valueType: DataPointValueType.JSON },
} satisfies Record<string, DataPointDefinition>
