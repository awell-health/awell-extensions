export const environment = {
  PLUGIN_ACTIVITY_CREATED_TOPIC:
    process.env.PLUGIN_ACTIVITY_CREATED_TOPIC ?? 'plugin-activity-created',
  PLUGIN_ACTIVITY_COMPLETED_TOPIC:
    process.env.PLUGIN_ACTIVITY_COMPLETED_TOPIC ?? 'plugin-activity-completed',
  PORT: Number(process.env.PORT ?? 3000),
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  PRETTY_LOGS: Boolean(process.env.PRETTY_LOGS ?? false),
}
