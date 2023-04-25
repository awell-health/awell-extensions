import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  FieldType,
  StringType,
  type Action,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { mapHealthieToActivityError } from '../errors'

const fields = {
  first_name: {
    id: 'first_name',
    label: 'First name',
    description: 'The first name of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'The last name of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  legal_name: {
    id: 'legal_name',
    label: 'Legal name',
    description:
      "The patient's legal name which will be used in CMS 1500 Claims, Invoices, and Superbills.",
    type: FieldType.STRING,
  },
  skipped_email: {
    id: 'skipped_email',
    label: 'Skipped email.',
    description:
      'When set to "false", an `email` is not required to create the patient.',
    type: FieldType.BOOLEAN,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email address of the patient.',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    required: true, // required until conditional field validation is implemented (based on `skipped_email`)
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: 'The date of birth of the patient.',
    type: FieldType.DATE,
  },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'The phone number of the patient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
  },
  send_invite: {
    id: 'send_invite',
    label: 'Send invite email',
    description:
      'Whether an invite email should be sent to the newly created patient.',
    type: FieldType.BOOLEAN,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'This is the ID of the provider and defaults to the user the API key is associated with. Also known as the `dietitian_id`.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  healthiePatientId: {
    key: 'healthiePatientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create a patient',
  description: 'Create a patient in Healthie.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      first_name,
      last_name,
      email,
      phone_number,
      provider_id,
      legal_name,
      dob,
      send_invite,
      skipped_email,
    } = fields
    try {
      if (isNil(first_name) || isNil(last_name)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`first_name` or `last_name` is missing',
              },
            },
          ],
        })
        return
      }
      const dont_send_welcome = send_invite !== true
      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        const { data } = await sdk.createPatient({
          input: {
            first_name,
            last_name,
            legal_name,
            email,
            phone_number,
            dietitian_id: provider_id === '' ? undefined : provider_id,
            skipped_email,
            dont_send_welcome,
            dob,
          },
        })

        if (!isNil(data.createClient?.messages)) {
          const errors = mapHealthieToActivityError(data.createClient?.messages)
          await onError({
            events: errors,
          })
          return
        }

        const healthiePatientId = data.createClient?.user?.id

        await onComplete({
          data_points: {
            healthiePatientId,
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
