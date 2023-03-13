import { GraphQLClient } from 'graphql-request'
import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '../../../lib/types'
import { type settings } from '../settings'
import { getSdk } from '../gql/sdk'

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
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const { fields, settings } = payload
    const { patientId } = fields
    const { apiUrl, apiKey } = settings
    if (apiUrl !== undefined && apiKey !== undefined) {
      const client = getSdk(
        new GraphQLClient(apiUrl, {
          headers: {
            AuthorizationSource: 'API',
            Authorization: `Basic ${apiKey}`,
          },
        })
      )
      const { data } = await client.getUser({ id: patientId })
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
      await onComplete()
    }
  },
}
