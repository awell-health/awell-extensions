import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { ElationAPIClient, makeDataWrapper } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { settingsSchema } from '../validation/settings.zod'
import { numberId } from '../validation/generic.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient ID (a number)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  first_name: {
    key: 'first_name',
    valueType: 'string',
  },
  last_name: {
    key: 'last_name',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'string',
  },
  sex: {
    key: 'sex',
    valueType: 'string',
  },
  primary_physician: {
    key: 'primary_physician',
    valueType: 'string',
  },
  caregiver_practice: {
    key: 'caregiver_practice',
    valueType: 'string',
  },
  mobile_phone: {
    key: 'mobile_phone',
    valueType: 'string',
  },
  middle_name: {
    key: 'middle_name',
    valueType: 'string',
  },
  actual_name: {
    key: 'actual_name',
    valueType: 'string',
  },
  gender_identity: {
    key: 'gender_identity',
    valueType: 'string',
  },
  legal_gender_marker: {
    key: 'legal_gender_marker',
    valueType: 'string',
  },
  pronouns: {
    key: 'pronouns',
    valueType: 'string',
  },
  sexual_orientation: {
    key: 'sexual_orientation',
    valueType: 'string',
  },
  ssn: {
    key: 'ssn',
    valueType: 'string',
  },
  ethnicity: {
    key: 'ethnicity',
    valueType: 'string',
  },
  race: {
    key: 'race',
    valueType: 'string',
  },
  preferred_language: {
    key: 'preferred_language',
    valueType: 'string',
  },
  notes: {
    key: 'notes',
    valueType: 'string',
  },
  previous_first_name: {
    key: 'previous_first_name',
    valueType: 'string',
  },
  previous_last_name: {
    key: 'previous_last_name',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.INTEGRATIONS,
  title: 'Get Patient',
  description: "Get patient profile using elation's patient api.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { base_url: baseUrl, ...auth } = settingsSchema.parse(
        payload.settings
      )
      const patientId = numberId.parse(payload.fields.patientId)

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth,
        baseUrl,
        makeDataWrapper,
      })
      const patientInfo = await api.getPatient(patientId)
      await onComplete({
        data_points: {
          first_name: patientInfo.first_name,
          last_name: patientInfo.last_name,
          dob: patientInfo.dob,
          sex: patientInfo.sex,
          primary_physician: String(patientInfo.primary_physician),
          caregiver_practice: String(patientInfo.caregiver_practice),
          mobile_phone: String(
            patientInfo.phones?.find((p) => p.phone_type === 'Mobile')?.phone
          ),
          middle_name: patientInfo.middle_name,
          actual_name: patientInfo.actual_name,
          gender_identity: patientInfo.gender_identity,
          legal_gender_marker: patientInfo.legal_gender_marker,
          pronouns: patientInfo.pronouns,
          sexual_orientation: patientInfo.sexual_orientation,
          ssn: patientInfo.ssn,
          ethnicity: patientInfo.ethnicity,
          race: patientInfo.race,
          preferred_language: patientInfo.preferred_language,
          notes: patientInfo.notes,
          previous_first_name: patientInfo.previous_first_name,
          previous_last_name: patientInfo.previous_last_name,
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
                category: 'BAD_REQUEST',
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
