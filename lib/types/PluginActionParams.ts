export interface PluginActionParams {
  activityId: string
  params: Record<string, unknown>
  settings?: Record<string, string | number>
}
