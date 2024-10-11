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
  onEvent: async ({ payload }) => {
    const { pathway, patient, activity } = payload
    const {
      fields: { campaignId, data, phoneNumber },
      settings: { basicAuthorization },
    } = validate({
      schema: z.object({ fields: FieldsSchema, settings: SettingsSchema }),
      payload,
    })

    const client = new GridspaceClient(basicAuthorization)

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

    await client.uploadContactsToCampaign(campaignId, requestBody)

    // No need to call onComplete since Gridspace will complete the activity later
  },
} satisfies Action<typeof fields, typeof settings>
