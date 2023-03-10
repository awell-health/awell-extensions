export const environment = {
  EXTENSION_ACTIVITY_CREATED_TOPIC:
    process.env.EXTENSION_ACTIVITY_CREATED_TOPIC ??
    'extension-activity-created',
  EXTENSION_ACTIVITY_COMPLETED_TOPIC:
    process.env.EXTENSION_ACTIVITY_COMPLETED_TOPIC ??
    'extension-activity-completed',
  EXTENSION_WEBHOOK_RECEIVED_TOPIC:
    process.env.EXTENSION_WEBHOOK_RECEIVED_TOPIC ??
    'extension-webhook-received',
  PORT: Number(process.env.PORT ?? 3000),
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  PRETTY_LOGS: Boolean(process.env.PRETTY_LOGS ?? false),
}
