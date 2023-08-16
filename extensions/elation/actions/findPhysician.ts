import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'

const fields = {
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: 'First Name to search for.',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: 'Last Name to search for.',
    type: FieldType.STRING,
    required: false,
  },
  npi: {
    id: 'npi',
    label: 'NPI (National Provider Identifier)',
    description: 'NPI to search for.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  physicianId: {
    key: 'physicianId',
    valueType: 'number',
  },
  physicianFirstName: {
    key: 'physicianFirstName',
    valueType: 'string',
  },
  physicianLastName: {
    key: 'physicianLastName',
    valueType: 'string',
  },
  physicianCredentials: {
    key: 'physicianCredentials',
    valueType: 'string',
  },
  physicianEmail: {
    key: 'physicianEmail',
    valueType: 'string',
  },
  physicianNPI: {
    key: 'physicianNPI',
    valueType: 'string',
  },
  physicianUserId: {
    key: 'physicianUserId',
    valueType: 'number',
  },
  caregiverPracticeId: {
    key: 'caregiverPracticeId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const findPhysician: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findPhysician',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find Physician',
  description: "Retrieve a physician using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { firstName, lastName, npi } = payload.fields

    const api = makeAPIClient(payload.settings)
    const physiciansList = await api.findPhysicians({
      params: {
        first_name: firstName,
        last_name: lastName,
        npi,
      },
    })

    if (physiciansList.count !== 1) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Find Physicians returned ${physiciansList.count} results, but the number of results must equal exactly 1.`,
            },
            error: {
              category: 'WRONG_DATA',
              message: `Find Physicians returned ${physiciansList.count} results, but the number of results must equal exactly 1.`,
            },
          },
        ],
      })
      return
    }

    const physician = physiciansList.results[0]
    await onComplete({
      data_points: {
        physicianId: String(physician.id),
        physicianFirstName: physician.first_name,
        physicianLastName: physician.last_name,
        physicianCredentials: physician.credentials,
        physicianEmail: physician.email,
        physicianNPI: physician.npi,
        physicianUserId: String(physician.user_id),
        caregiverPracticeId: String(physician.practice),
      },
    })
  },
}
