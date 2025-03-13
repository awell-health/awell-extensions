export const mockFormDefinitionResponse = {
  form: {
    form: {
      id: 'form-1',
      title: 'Test Form',
      key: 'test_form',
      definition_id: 'form-def-1',
      release_id: 'release-1',
      questions: [
        {
          id: 'question-1',
          key: 'test_question',
          title: 'Test Question',
          userQuestionType: 'SHORT_TEXT',
          options: [],
          __typename: 'Question'
        },
        {
          id: 'question-2',
          key: 'yes_no_question',
          title: 'Yes/No Question',
          userQuestionType: 'YES_NO',
          options: [
            {
              label: 'Yes',
              value: 1,
              value_string: '1',
              __typename: 'Option'
            },
            {
              label: 'No',
              value: 0,
              value_string: '0',
              __typename: 'Option'
            }
          ],
          __typename: 'Question'
        }
      ],
      __typename: 'FormDefinition'
    },
    __typename: 'FormDefinitionResponse'
  }
} 