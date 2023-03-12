import { type DataPointDefinition, type Webhook } from '../../../lib/types'

const dataPoints = {
  complete_date: {
    key: 'complete_date',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

interface Payload {
  complete_date: string
  pathway: {
    id: string
    patient_id: string
  }
  event_type: 'pathway.completed'
}

export const pathwayCompleted: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'pathwayCompleted',
  dataPoints,
  onWebhookReceived: async ({ pathway, complete_date }) => ({
    pathway_id: pathway.id,
    patient_id: pathway.patient_id,
    data_points: {
      complete_date,
    },
  }),
}
