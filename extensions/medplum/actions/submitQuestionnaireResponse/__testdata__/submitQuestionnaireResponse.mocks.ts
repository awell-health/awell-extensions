import {
  type FormPayload,
  type FormResponsePayload,
} from '@awell-health/awell-sdk'
import { type DeepPartial } from '../../../../../src/lib/types'

export const simpleFormMockResponse = {
  success: true,
  form: {
    id: 'form-published-id',
    definition_id: 'form-definition-id',
    title: 'Simple form',
    release_id: 'form-release-id',
    key: 'simple-form',
    metadata: '{"form": "metadata"}',
    questions: [
      {
        id: 'question-id',
        definition_id: 'question-definition-id',
        title: 'Single select (number)',
        key: 'singleSelectNumber',
        dataPointValueType: 'NUMBER',
        questionType: 'MULTIPLE_CHOICE',
        userQuestionType: 'MULTIPLE_CHOICE',
        options: [
          {
            id: 'zOTvuy0usHkb',
            value: 0,
            value_string: '0',
            label: 'Option 1',
            __typename: 'Option',
          },
          {
            id: 'q6jRNHKATieI',
            value: 1,
            value_string: '1',
            label: 'Option 2',
            __typename: 'Option',
          },
          {
            id: 'vvMBtwpHl0o5',
            value: 2,
            value_string: '2',
            label: 'Option 3',
            __typename: 'Option',
          },
        ],
      },
    ],
  },
} satisfies DeepPartial<FormPayload>

export const simpleFormResponseMockResponse = {
  success: true,
  response: {
    answers: [
      {
        question_id: 'question-id',
        value: '1',
        label: 'Option 2',
        value_type: 'NUMBER',
      },
    ],
  },
} satisfies DeepPartial<FormResponsePayload>
