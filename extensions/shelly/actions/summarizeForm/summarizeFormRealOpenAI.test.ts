import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { summarizeForm } from '.'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { detectLanguageWithLLM } from '../../lib/detectLanguageWithLLM'

// Spy on detectLanguageWithLLM to verify it's called
jest.mock('../../lib/detectLanguageWithLLM', () => {
  const originalModule = jest.requireActual('../../lib/detectLanguageWithLLM')
  return {
    ...originalModule,
    detectLanguageWithLLM: jest.fn(originalModule.detectLanguageWithLLM),
  }
})

// Mock getCareFlowDetails
jest.mock('../../lib/getCareFlowDetails', () => ({
  getCareFlowDetails: jest.fn().mockResolvedValue({
    title: 'Test Care Flow',
    id: 'whatever',
    version: 3,
  }),
}))

jest.setTimeout(30000) // Increase timeout if needed for real LLM calls

const generateTestPayload = (overrides = {}) => {
  return {
    pathway: {
      id: 'test-pathway-id',
      definition_id: 'test-definition-id',
      tenant_id: 'test-tenant-id',
      org_slug: 'test-org-slug',
      org_id: 'test-org-id',
    },
    activity: {
      id: 'test-activity-id',
    },
    fields: {},
    settings: {},
    patient: {
      id: 'test-patient-id',
    },
    ...overrides,
  }
}

describe.skip('summarizeForm - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  // Define base payload to be reused across tests
  const basePayload = {
    pathway: {
      id: 'ai4rZaYEocjB',
      definition_id: 'whatever',
    },
    activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
    settings: {},
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000,
    })
  })

  it('Should call the real model with Bullet-points format', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [
              {
                id: 'q1',
                title: 'Test Question',
                type: 'TEXT',
                options: [],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'Test Answer',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          '<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB)',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model with additional instructions', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
        additionalInstructions:
          'Focus on highlighting any abnormal values or concerning responses.',
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [
              {
                id: 'q1',
                title: 'Test Question',
                type: 'TEXT',
                options: [],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'Test Answer with focus on concerning values',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify language detection was called
    expect(detectLanguageWithLLM).toHaveBeenCalled()

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          '<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB)',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model with Text paragraph format', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'Default',
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [
              {
                id: 'q1',
                title: 'Test Question',
                type: 'TEXT',
                options: [],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'Test Answer',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          '<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB)',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model and use mocked form data with Text paragraph format', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'Default',
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [
              {
                id: 'q1',
                title: 'Test Question',
                type: 'TEXT',
                options: [],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'Test Answer',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          '<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB)',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model and use mocked form data', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: mockFormDefinitionResponse,
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: mockFormResponseResponse,
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          '<p><strong>Important Notice:</strong> The content provided is an AI-generated summary of form responses of version 3 of Care Flow "Test Care Flow" (ID: ai4rZaYEocjB)',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should detect Spanish language from Spanish form content', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default', // Set to Default to trigger language detection
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'Formulario de Evaluación de Salud',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            title: 'Formulario de Evaluación de Salud',
            questions: [
              {
                id: 'q1',
                title: '¿Cómo calificaría su salud general?',
                type: 'SELECT',
                options: [
                  { value: 'excelente', label: 'Excelente' },
                  { value: 'bueno', label: 'Bueno' },
                ],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'bueno',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify language detection was called
    expect(detectLanguageWithLLM).toHaveBeenCalled()

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)

    // The summary should contain Spanish disclaimer
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('Aviso Importante'),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should NOT use language detection when a specific language is provided', async () => {
    const payload = generateTestPayload({
      ...basePayload,
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'French', // Specific language
      },
    })

    const mockQuery = jest
      .fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW',
            },
          },
        },
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [
            {
              id: 'form_activity_id',
              status: 'DONE',
              date: '2024-09-11T22:56:58.607Z',
              object: {
                id: 'OGhjJKF5LRmo',
                name: 'General Dummy Form',
                type: 'FORM',
              },
              context: {
                step_id: 'Xkn5dkyPA5uW',
              },
            },
          ],
        },
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [
              {
                id: 'q1',
                title: 'Test Question',
                type: 'TEXT',
                options: [],
              },
            ],
          },
        },
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'Test Answer',
              },
            ],
          },
        },
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery,
      },
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    // Verify language detection was NOT called
    expect(detectLanguageWithLLM).not.toHaveBeenCalled()

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)

    // The summary should contain French content (check for French text instead of specific header)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(
          'Le contenu fourni est un résumé généré par IA',
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)
})
