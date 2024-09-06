import {
  type Action,
  type Fields,
  type Field,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { z } from 'zod'
import axios from 'axios'
import { isNil } from 'lodash'

const fields: Fields = {
  payload: {
    type: FieldType.JSON,
    id: 'payload',
    label: 'Payload',
    description:
      "Payload (in JSON format: {'fields': {key: val}, 'settings': {key: val}})",
  },
} satisfies Record<string, Field>

const dataPoints = {
  response: {
    key: 'response',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

const PayloadSchema = z.object({
  fields: z.object({
    payload: z.any(),
  }),
  settings: z.object({
    url: z.string(),
  }),
})

export const mtls: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'mtls',
  title: 'mTLS Connect',
  description:
    'An extension action that communicates using mTLS by sending a POST request.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    if (isNil(helpers)) {
      throw new Error('Helpers are not provided')
    }
    const { fields, settings } = PayloadSchema.parse(payload)
    const clientPayload = fields.payload ?? {}
    const { data, status } = await axios.post<{
      data_points: any
      events: any
      response: 'success' | 'failure'
    }>(
      `${settings.url}`,
      { data: clientPayload },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: helpers.httpsAgent(),
      }
    )
    if (status === 200) {
      await onComplete({
        data_points: { response: JSON.stringify(data) },
      })
    } else {
      throw new Error(`Error: ${JSON.stringify(data)}`)
    }
  },
}
