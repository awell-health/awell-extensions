import { getSubActivityLogs, HealthieOmitType } from '.'

describe('getMappingStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work when there are mapping errors', async () => {
    const data = [
      {
        questionId: 'question_1',
        reason:
          'No corresponding question definition found in the form definition',
        omitType: HealthieOmitType.QUESTION_NOT_FOUND_IN_FORM_DEFINITION,
      },
      {
        questionId: 'question_2',
        reason:
          'Unable to map this question to a Healthie question because it misses the `healthieCustomModuleId` metadata required for proper integration.',
        omitType: HealthieOmitType.MISSING_MAPPING,
      },
      {
        questionId: 'question_3',
        reason: 'Unknown error',
        omitType: HealthieOmitType.OTHER,
      },
      {
        questionId: 'question_4',
        reason:
          'Unable to map this question to a Healthie question because it misses the `healthieCustomModuleId` metadata required for proper integration.',
        omitType: HealthieOmitType.MISSING_MAPPING,
      },
    ]

    const res = getSubActivityLogs(data)

    expect(res).toEqual([
      {
        date: expect.any(String),
        text: {
          en: 'Missing mapping for the below questions: question_2, question_4',
        },
        error: {
          category: 'MISSING_SETTINGS',
          message:
            'Missing mapping for the below questions: question_2, question_4',
        },
      },
      {
        date: expect.any(String),
        text: {
          en: 'The following questions in the response could not be linked to a question definition in the form definition: question_1',
        },
        error: {
          category: 'SERVER_ERROR',
          message:
            'The following questions in the response could not be linked to a question definition in the form definition: question_1',
        },
      },
      {
        date: expect.any(String),
        text: {
          en: 'There was an unexpected error transforming the following Awell form answers to Healthie form answers: question_3: Unknown error',
        },
        error: {
          category: 'SERVER_ERROR',
          message:
            'There was an unexpected error transforming the following Awell form answers to Healthie form answers: question_3: Unknown error',
        },
      },
    ])
  })

  test('Should work when there are no mapping errors', async () => {
    const res = getSubActivityLogs([])

    expect(res).toEqual([])
  })
})
