/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { allergySchema } from '../validation/allergy.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient for whom the lab order is being created.',
    type: FieldType.NUMERIC,
    required: true,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of the allergy drug',
    type: FieldType.STRING,
    required: true,
  },
  startDate: {
    id: 'startDate',
    label: 'Start Date',
    description: 'The date the allergy started (defaults to today)',
    type: FieldType.DATE,
    required: false,
  },
  reaction: {
    id: 'reaction',
    label: 'Reaction',
    description: 'The reaction to the drug',
    type: FieldType.STRING,
    required: false,
  },
  severity: {
    id: 'severity',
    label: 'Severity',
    description: 'How severe the reaction is',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  allergyId: {
    key: 'allergyId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const createAllergy: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAllergy',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add Allergy',
  description:
    'Adds allergy to the patient profile. If allergy.name is NKDA, we will document a structured NKDA in the patient chart instead of creating a patient allergy called "NKDA"',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, name, startDate, reaction, severity } = payload.fields

      const allergy = allergySchema.parse({
        patient: patientId,
        name,
        start_date: startDate,
        reaction,
        severity,
      })

      const api = makeAPIClient(payload.settings)
      const { id } = await api.createAllergy(allergy)
      await onComplete({
        data_points: {
          allergyId: String(id),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
