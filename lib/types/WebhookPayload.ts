export interface WebhookPayload<DPKeys extends string> {
  pathway_id?: string
  patient_id?: string
  data_points: Record<DPKeys, string>
}
