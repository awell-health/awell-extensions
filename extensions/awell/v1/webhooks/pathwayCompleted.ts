import { isNil } from 'lodash'
import { type DataPointDefinition, type Webhook } from '../../../../lib/types'

const dataPoints = {
  pathway_definition_id: {
    key: 'pathway_definition_id',
    valueType: 'string',
  },
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
    pathway_definition_id: string
  }
  event_type: 'pathway.completed'
}

export const pathwayCompleted: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'pathwayCompleted',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const { pathway, complete_date } = payload
    if (isNil(pathway.pathway_definition_id)) {
      await onError({
        response: {
          statusCode: 400,
          message: 'Pathway definition id is required',
        },
      })
    } else {
      await onSuccess({
        patient_id: pathway.patient_id,
        pathway_id: pathway.id,
        data_points: {
          pathway_definition_id: pathway.pathway_definition_id,
          complete_date,
        },
      })
    }
  },
}
