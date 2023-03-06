export interface ExtensionActionParams {
  activityId: string
  params: Record<string, unknown>
  settings?: Record<string, string | number>
}
