import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  signerRole: {
    id: 'signerRole',
    label: 'Signer role',
    description:
      "Must match an existing role in chosen template. It's case-sensitive.",
    type: FieldType.STRING,
    required: true,
  },
  signerName: {
    id: 'signerName',
    label: 'Signer name',
    description: 'The name of the signer.',
    type: FieldType.STRING,
    required: true,
  },
  signerEmailAddress: {
    id: 'signerEmailAddress',
    label: 'Signer email address',
    description: 'The email address of the signer.',
    type: FieldType.STRING,
    required: true,
  },
  templateId: {
    id: 'templateId',
    label: 'Template ID',
    description:
      'Use the template id to create a SignatureRequest from a template.',
    type: FieldType.STRING,
    required: true,
  },
  title: {
    id: 'title',
    label: 'Title',
    description: 'The title you want to assign to the SignatureRequest.',
    type: FieldType.STRING,
    required: false,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject in the email that will be sent to the signer.',
    type: FieldType.STRING,
    required: false,
  },
  message: {
    id: 'message',
    label: 'Message',
    description:
      'The custom message in the email that will be sent to the signer.',
    type: FieldType.STRING,
    required: false,
  },
  customFields: {
    id: 'customFields',
    label: 'Custom fields',
    description:
      'An array defining values and options for custom fields. Required when a custom field exists in the template.',
    type: FieldType.JSON,
    required: false,
  },
} satisfies Record<string, Field>
