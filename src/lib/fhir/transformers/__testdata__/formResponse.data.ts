import {
  type FormResponse,
  DataPointValueType,
} from '../../../../../extensions/awell/v1/gql/graphql'

export const formResponseMock: FormResponse = {
  answers: [
    {
      question_id: '-hCGgfqR3zZ7',
      value: '1',
      value_type: DataPointValueType.Boolean,
    },
    {
      question_id: 'bVGD5I6ckKZx',
      value: '1',
      label: 'Option 2',
      value_type: DataPointValueType.Number,
    },
    {
      question_id: 'C9dHRQWojfkP',
      value: '1',
      value_type: DataPointValueType.Number,
    },
    {
      question_id: 'KcvNZ5dJHPf0',
      value: 'option_3',
      label: 'Option 3',
      value_type: DataPointValueType.String,
    },
    {
      question_id: 'knDhobvb9xWJ',
      value: '["3232","some option"]',
      label: 'Option 2, Option 1',
      value_type: DataPointValueType.StringsArray,
    },
    {
      question_id: 'PwQq1MVz3sYn',
      value: 'long hello world',
      value_type: DataPointValueType.String,
    },
    {
      question_id: 'saf_RczvRbay',
      value: '[0,2]',
      label: 'Option 1, Option 3',
      value_type: DataPointValueType.NumbersArray,
    },
    {
      question_id: 'uuir17H9iz9P',
      value: '+32476581696',
      value_type: DataPointValueType.Telephone,
    },
    {
      question_id: 'vn-VF15nIsv_',
      value: 'hello world',
      value_type: DataPointValueType.String,
    },
    {
      question_id: 'yiVk87BHUNYs',
      value: '3',
      value_type: DataPointValueType.Number,
    },
    {
      question_id: 'ypR9Yudhfsbg',
      value: '2024-05-04T00:00:00.000Z',
      value_type: DataPointValueType.Date,
    },
  ],
}
