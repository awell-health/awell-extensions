import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { validateGetPatient } from '../validation/getPatient.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description:
      'The ID of the patient in Healthie you would like to retrieve.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  firstName: {
    key: 'firstName',
    valueType: 'string',
  },
  lastName: {
    key: 'lastName',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'date',
  },
  gender: {
    key: 'gender',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  phoneNumber: {
    key: 'phoneNumber',
    valueType: 'telephone',
  },
  primaryProviderId: {
    key: 'primaryProviderId',
    valueType: 'string',
  },
  groupName: {
    key: 'groupName',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve the details of a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId } = fields
    try {
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.getUser({ id: patientId })

        const {
          data: { dob, phoneNumber },
          events,
        } = validateGetPatient(data.user)

        await onComplete({
          data_points: {
            firstName: data.user?.first_name,
            lastName: data.user?.last_name,
            dob,
            email: data.user?.email,
            gender: data.user?.gender,
            phoneNumber,
            groupName: data.user?.user_group?.name,
            primaryProviderId: data.user?.dietitian_id,
          },
          events,
        })
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API client requires an API url and API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing api url or api key',
              },
            },
          ],
        })
      }
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Healthie API reported an error' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
