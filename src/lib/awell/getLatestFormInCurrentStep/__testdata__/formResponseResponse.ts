import { type FormResponsePayload } from '@awell-health/awell-sdk'
import { type DeepPartial } from '../../../types'

export const mockFormResponseResponse = {
  success: true,
  response: {
    answers: [
      {
        question_id: 'single_select_number',
        value: '0',
        value_type: 'NUMBER',
        label: 'Option 1',
        __typename: 'Answer',
      },
      {
        question_id: 'single_select_string',
        value: 'option_1',
        value_type: 'STRING',
        label: 'Option 1',
        __typename: 'Answer',
      },
      {
        question_id: 'multi_select_number',
        value: '[0,1]',
        value_type: 'NUMBERS_ARRAY',
        label: 'Option 1, Option 2',
        __typename: 'Answer',
      },
      {
        question_id: 'multi_select_string',
        value: '["option_1","option_2"]',
        value_type: 'STRINGS_ARRAY',
        label: 'Option 1, Option 2',
        __typename: 'Answer',
      },
      {
        question_id: 'yes_no',
        value: '1',
        value_type: 'BOOLEAN',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'slider',
        value: '5',
        value_type: 'NUMBER',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'date',
        value: '2024-09-17T00:00:00.000Z',
        value_type: 'DATE',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'email',
        value: 'nick@awellhealth.com',
        value_type: 'STRING',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'number',
        value: '1',
        value_type: 'NUMBER',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'short_text',
        value: 'A short answer',
        value_type: 'STRING',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'long_text',
        value: 'A long text\n\nNew paragraph',
        value_type: 'STRING',
        label: null,
        __typename: 'Answer',
      },
      {
        question_id: 'phone',
        value: '+32476581696',
        value_type: 'TELEPHONE',
        label: null,
        __typename: 'Answer',
      },
    ],
  },
} satisfies DeepPartial<FormResponsePayload>
