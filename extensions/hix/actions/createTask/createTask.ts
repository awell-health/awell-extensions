import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { z } from 'zod'
import { settings as settingsDefinition, SettingsValidationSchema } from '../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'

export const createTask: Action<
  typeof fields,
  typeof settingsDefinition,
  keyof typeof dataPoints
> = {
  key: 'createTask',
  title: 'Creëer taak in HiX',
  description:
    'Creëert een taak op de werklijst van de zorgverlener in HiX. De taak verschijnt op "Mijn werklijst" en kan vanuit HiX gelanceerd worden.',
  category: Category.EHR_INTEGRATIONS,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: {
          patientId,
          patientName,
          title,
          description,
          requester,
          launchUrl,
        },
        settings: { apiUrl, tasksIngestToken },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tasksIngestToken}`,
        },
        body: JSON.stringify({
          patient_id: patientId,
          patient_name: patientName,
          title,
          description,
          requester: requester ?? 'ZTOP',
          launch_url: launchUrl,
        }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        throw new Error(
          `HiX task endpoint returned ${response.status} ${response.statusText}: ${responseText}`
        )
      }

      const responseBody = (await response.json().catch(() => ({}))) as {
        id?: string
      }

      await onComplete({
        data_points: {
          taskId: responseBody.id ?? '',
          statusCode: String(response.status),
        },
      })
    } catch (error) {
      const parsedError = error as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: parsedError.message ?? 'Unexpected error',
            },
            error: {
              category: 'SERVER_ERROR',
              message: parsedError.message ?? 'Unexpected error',
            },
          },
        ],
      })
    }
  },
}
