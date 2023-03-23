import { isNil } from 'lodash'
import {
  FieldType,
  StringType,
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
  first_name: {
    id: 'first_name',
    label: 'First name',
    description: 'First name of the patient',
    type: FieldType.STRING,
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'Last name of the patient',
    type: FieldType.STRING,
  },
  legal_name: {
    id: 'legal_name',
    label: 'Legal name',
    description: "The patient's legal name which will be used in CMS 1500 Claims, Invoices, and Superbills.",
    type: FieldType.STRING,
  },
  // ! TODO: BOOLEAN field implementation needed
  // skipped_email: {
  //   id: 'skipped_email',
  //   label: 'Skipped email',
  //   type: FieldType.BOOLEAN,
  // },
  email: {
    id: 'email',
    label: 'Email',
    description: 'Email address of the patient',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
  },
  // ! TODO: DATE field implementation needed
  // dob: {
  //   id: 'dob',
  //   label: 'Date of birth',
  //   description: 'Date of birth of the patient',
  //   type: FieldType.DATE,
  // },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'Phone number of the patient',
    type: FieldType.STRING,
    stringType: StringType.PHONE
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description: "Also known as the `dietitian_id`. This is the ID of the provider. Defaults to the authenticated user's ID.",
    type: FieldType.STRING,
  },
  user_group_id: {
    id: 'user_group_id',
    label: 'User group ID',
    description: 'The user group the patient belongs to.',
    type: FieldType.STRING,
  },
  // ! TODO: BOOLEAN field implementation needed
  // active: {
  //   id: 'active',
  //   label: 'Active',
  //   description: 'Whether the patient is still active.',
  //   type: FieldType.BOOLEAN,
  // },
  height: {
    id: 'height',
    label: 'Height',
    description: 'Height of the patient',
    type: FieldType.STRING,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description: 'Either "Female", "Male", or "Other"',
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
    description: 'Either "Female", "Male"',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const updatePatient: Action<
  typeof fields,
  typeof settings
> = {
  key: 'updatePatient',
  category: Category.INTEGRATIONS,
  title: 'Update a patient',
  description: 'Update a patient in Healthie.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { id, first_name, last_name, legal_name, email, phone_number, provider_id, gender, gender_identity, height, sex, user_group_id } = fields
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


        await sdk.updatePatient({
          input: {
            id,
            first_name,
            last_name,
            legal_name,
            email,
            phone_number,
            dietitian_id: provider_id,
            gender,
            gender_identity,
            height,
            sex,
            user_group_id
          }
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