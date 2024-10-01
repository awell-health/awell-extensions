export const mockFormDefinitionOneResponse = {
  form: {
    questions: [
      {
        id: 'short_text',
        definition_id: 'qiIFXlNLUVzN',
        title: 'Question that collects a string value',
        key: 'questionThatCollectsAStringValue',
        dataPointValueType: 'STRING',
        questionType: 'INPUT',
        userQuestionType: 'SHORT_TEXT',
        metadata: JSON.stringify({ healthieCustomModuleId: 'short_text' }),
        options: [],
        __typename: 'Question',
        questionConfig: null,
        rule: null,
      },
    ],
  },
}

export const mockFormDefinitionTwoResponse = {
  form: {
    questions: [
      {
        id: 'long_text',
        definition_id: 'tSFHKGROz6Zm',
        title: 'Question that collects a string but long-form (textarea)',
        key: 'questionThatCollectsAStringButLongFormTextarea',
        dataPointValueType: 'STRING',
        questionType: 'INPUT',
        userQuestionType: 'LONG_TEXT',
        metadata: JSON.stringify({ healthieCustomModuleId: 'long_text' }),
        options: [],
        __typename: 'Question',
        questionConfig: null,
        rule: null,
      },
    ],
  },
}
