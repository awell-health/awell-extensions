import { isNil } from 'lodash'
import { mapHealthieToActivityError } from '../../../lib/errors'
import {
  type DataPointDefinition,
  FieldType,
  type Action,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'


const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie',
    type: FieldType.STRING,
    required: true,
  },
  name: {
    id: 'name',
    label: 'Name',
    description: 'The name of the address',
    type: FieldType.STRING,
  },
  country: {
    id: 'country',
    label: 'Country',
    description: 'The country of the patient',
    type: FieldType.STRING,
  },
  state: {
    id: 'state',
    label: 'State',
    description: "The state patient's lives in",
    type: FieldType.STRING,
  },
  city: {
    id: 'city',
    label: 'City',
    description: 'The city of the patient',
    type: FieldType.STRING,
  },
  zip: {
    id: 'zip',
    label: 'Zip code',
    description: 'The zip code of the patient',
    type: FieldType.STRING,
  },
  line1: {
    id: 'line1',
    label: 'Line 1',
    description: 'The Line 1 of the address',
    type: FieldType.STRING,
    required: true,
  },
  line2: {
    id: 'line2',
    label: 'Line 2',
    description: 'The Line 2 of the address',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  locationId: {
    key: 'locationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createLocation: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createLocation',
  category: Category.INTEGRATIONS,
  title: 'Create location',
  description: 'Create location for a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, name, country, state, city, zip, line1, line2 } = fields
    try {
      if (isNil(id)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`id` is missing',
              },
            },
          ],
        })
        return;
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createLocation({
          input: {
            user_id: id,
            name,
            country,
            state,
            city,
            zip,
            line1,
            line2
          }
        })

        if (!isNil(data.createLocation?.messages)) {
          const errors = mapHealthieToActivityError(data.createLocation?.messages)
          await onError({
            events: errors,
          })
          return
        }

        const locationId = data.createLocation?.location?.id;

        await onComplete(
          {
            data_points: {
              locationId
            }
          }
        )
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