import { isNil } from 'lodash'
import {
  FieldType,
  StringType,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getSdk } from '../gql/sdk'
import { initialiseClient } from '../graphqlClient'
import { type settings } from '../settings'
import { HealthieError, mapHealthieToActivityError } from '../errors'

const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  first_name: {
    id: 'first_name',
    label: 'First name',
    description: 'The first name of the patient.',
    type: FieldType.STRING,
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'The last name of the patient.',
    type: FieldType.STRING,
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
    label: 'Skipped email',
    type: FieldType.BOOLEAN,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email address of the patient.',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: 'Date of birth of the patient',
    type: FieldType.DATE,
  },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'The phone number of the patient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'This is the ID of the provider and defaults to the user the API key is associated with. Also known as the `dietitian_id`.',
    type: FieldType.STRING,
  },
  user_group_id: {
    id: 'user_group_id',
    label: 'User group ID',
    description: 'The user group the patient belongs to.',
    type: FieldType.STRING,
  },
  active: {
    id: 'active',
    label: 'Active',
    description: 'Whether the patient is still active.',
    type: FieldType.BOOLEAN,
  },
  height: {
    id: 'height',
    label: 'Height',
    description: 'The height of the patient.',
    type: FieldType.STRING,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description:
      'The gender of the patient. Either "Female", "Male", or "Other".',
    type: FieldType.STRING,
  },
  gender_identity: {
    id: 'gender_identity',
    label: 'Gender identity',
    description: 'Should only be passed when gender is "Other"',
    type: FieldType.STRING,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: 'The sex of the patient. Either "Female", "Male".',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update a patient',
  description: 'Update a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      id,
      first_name,
      last_name,
      legal_name,
      email,
      phone_number,
      provider_id,
      gender,
      gender_identity,
      height,
      sex,
      user_group_id,
      active,
      dob,
      skipped_email,
    } = fields
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
        return
      }

      const client = initialiseClient(settings)
      if (client !== undefined) {
        const sdk = getSdk(client)
        await sdk.updatePatient({
          input: {
            id,
            first_name,
            last_name,
            legal_name,
            email,
            phone_number,
            dietitian_id: provider_id === '' ? undefined : provider_id,
            gender,
            gender_identity,
            height,
            sex,
            user_group_id,
            active,
            dob,
            skipped_email,
          },
        })

        await onComplete()
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
      if (err instanceof HealthieError) {
        const errors = mapHealthieToActivityError(err.errors)
        await onError({
          events: errors,
        })
      } else {
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
    }
  },
}
