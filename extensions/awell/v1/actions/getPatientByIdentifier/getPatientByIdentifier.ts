import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const getPatientByIdentifier: Action<typeof fields, typeof settings> = {
  key: 'getPatientByIdentifier',
  category: Category.WORKFLOW,
  title: 'Get patient by identifier',
  description:
    'Retrieve a patient based on the provided identifier system and value',
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onEvent: async ({
    payload,
    onComplete,
    helpers: { awellSdk },
  }): Promise<void> => {
    const {
      fields: { system, value },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })
    const { apiKey, apiUrl } = await awellSdk()
    const sdk = new AwellSdk({ apiKey, apiUrl: apiUrl as string })

    const patient = await sdk.getPatientByIdentifier({
      system,
      value,
    })

    if (isNil(patient)) {
      await onComplete({
        data_points: {
          patientAlreadyExists: String(false),
          patientId: undefined,
        },
        events: [
          addActivityEventLog({
            message: `No patient with identifier system ${system} and value ${value} exists.`,
          }),
        ],
      })
      return
    }

    await onComplete({
      data_points: {
        patientAlreadyExists: String(true),
        patientId: patient.id,
      },
      events: [
        addActivityEventLog({
          message: `Patient with identifier system ${system} and value ${value} was found. The Awell ID of the patient is ${patient.id}.`,
        }),
      ],
    })
  },
}
