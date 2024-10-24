import { Category, validate, type Action } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsSchema } from './config'
import { type settings, SettingsSchema } from '../../settings'
import { GridspaceClient } from '../../lib'
import { z } from 'zod'
import { keys, values } from 'lodash'

export const uploadContactToCampaign = {
  key: 'uploadContactToCampaign',
  title: 'Upload Contact to Campaign',
  description: 'Add a contact to a Gridspace autodialer campaign.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete }) => {
    const { pathway, patient, activity } = payload
    const {
      fields: { campaignId, data, phoneNumber },
      settings: { accountId, clientSecret },
    } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })

    const client = new GridspaceClient({ accountId, clientSecret })

    const contactData = {
      phone_number: phoneNumber,
      ...data,
      activity_id: activity.id,
      pathway_id: pathway.id,
      pathway_definition_id: pathway.definition_id,
      patient_id: patient.id,
    }

    const columnNames = keys(contactData)
    const contactRow = values(contactData)

    const requestBody = {
      column_names: columnNames,
      phone_number_column_name: 'phone_number',
      contact_rows: [contactRow],
    }

    const { num_uploaded_contacts = 0 } = await client.uploadContactsToCampaign(
      campaignId,
      requestBody
    )

    const event_text =
      num_uploaded_contacts === 0
        ? { en: `Contact was NOT uploaded to campaign ${campaignId}` }
        : { en: `Contact uploaded to campaign ${campaignId}` }

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: event_text,
        },
      ],
      data_points: {
        num_uploaded_contacts: String(num_uploaded_contacts),
      },
    })
  },
} satisfies Action<typeof fields, typeof settings>
