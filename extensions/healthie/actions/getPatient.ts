import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient identifier',
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
    valueType: 'string',
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
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: 'Healthie API',
  title: 'Retrieve a patient',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { patientId } = fields
    const client = initialiseClient(settings)
    if (client !== undefined) {
      const sdk = getSdk(client)
      const { data } = await sdk.getUser({ id: patientId })
      await onComplete({
        data_points: {
          firstName: data.user?.first_name,
          lastName: data.user?.last_name,
          dob: data.user?.dob,
          email: data.user?.email,
          gender: data.user?.gender,
          phoneNumber: data.user?.phone_number,
        },
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
  },
}
