export const mockFormDefinitionOneResponse = {
  form: {
    title: 'Screening Form',
    questions: [
      {
        id: 'short_text',
        definition_id: 'qiIFXlNLUVzN',
        title: 'Question that collects a string value',
        key: 'questionThatCollectsAStringValue',
        dataPointValueType: 'STRING',
        questionType: 'INPUT',
        userQuestionType: 'SHORT_TEXT',
        options: [],
      },
    ],
  },
}

export const mockFormDefinitionTwoResponse = {
  form: {
    title: 'Intake Form',
    questions: [
      {
        id: 'long_text',
        definition_id: 'tSFHKGROz6Zm',
        title: 'Question that collects a long-form answer',
        key: 'questionThatCollectsALongFormAnswer',
        dataPointValueType: 'STRING',
        questionType: 'INPUT',
        userQuestionType: 'LONG_TEXT',
        options: [],
      },
    ],
  },
}
