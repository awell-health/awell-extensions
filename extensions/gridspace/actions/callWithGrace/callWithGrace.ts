import { Category, validate, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsSchema } from './config'
import { type settings, SettingsSchema } from '../../settings'
import { GridspaceClient } from '../../lib'
import { z } from 'zod'
import { isNil } from 'lodash'
export const callWithGrace = {
  key: 'callWithGrace',
  title: 'Call with Grace',
  description: 'Use AI phone conversations to communicate with your patients.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError }) => {
    const { pathway, patient } = payload
    const {
      fields: { flowId, data, phoneNumber },
      settings: { accountId, clientSecret },
    } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })
    const client = new GridspaceClient({ accountId, clientSecret })
    const allData = {
      ...data,
      phone_number: phoneNumber,
      patient_id: patient.id,
      ...(!isNil(patient.profile) && { ...patient.profile }),
      pathway_id: pathway.id,
      pathway_definition_id: pathway.definition_id,
      activity_id: payload.activity.id,
    }
    const resp = await client.callWithGrace(flowId, allData)
    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: { en: `Call with Grace. Response: ${JSON.stringify(resp)}` },
        },
      ],
      data_points: {},
    })
  },
} satisfies Action<typeof fields, typeof settings>
