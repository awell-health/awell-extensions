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

const isValidPathway = (d: Payload['pathway']): d is Payload['pathway'] => {
  if (isNil(d.id)) {
    return false
  }
  if (isNil(d.patient_id)) {
    return false
  }
  if (isNil(d.pathway_definition_id)) {
    return false
  }
  return true
}

export const pathwayCompleted: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'pathwayCompleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { pathway, complete_date } = payload
    if (isValidPathway(pathway)) {
      await onSuccess({
        pathway_id: pathway.id,
        patient_id: pathway.patient_id,
        data_points: {
          pathway_definition_id: pathway.pathway_definition_id,
          complete_date,
        }
      })
    } else {
      await onError({
        // should automatically send a 400, but if we want...
        response: {
          statusCode: 400,
          message: 'No pathway specified'
        }
      })
    }
  }
}
