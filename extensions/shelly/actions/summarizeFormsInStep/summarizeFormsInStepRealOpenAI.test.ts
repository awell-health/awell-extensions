/* eslint-disable @typescript-eslint/no-var-requires */

import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeFormsInStep } from '.'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'
import { detectLanguageWithLLM } from '../../lib/detectLanguageWithLLM'

// Spy on detectLanguageWithLLM to verify it's called
jest.mock('../../lib/detectLanguageWithLLM', () => {
  const originalModule = jest.requireActual('../../lib/detectLanguageWithLLM');
  return {
    ...originalModule,
    detectLanguageWithLLM: jest.fn(originalModule.detectLanguageWithLLM)
  };
});

jest.setTimeout(30000) // Increase timeout for real LLM calls

describe.skip('summarizeFormsInStep - Real OpenAI calls', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeFormsInStep)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    helpers.getOpenAIConfig = jest.fn().mockReturnValue({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000
    })
  })

  it('Should summarize multiple forms with real OpenAI', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
      settings: {}
    })

    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [{
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'Test Form',
              type: 'FORM'
            },
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }]
        }
      })
      .mockResolvedValueOnce({
        form: {
          success: true,
          form: {
            id: 'OGhjJKF5LRmo',
            title: 'Health Assessment Form',
            questions: [
              {
                id: 'q1',
                title: 'How would you rate your overall health?',
                type: 'SELECT',
                options: [
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' }
                ]
              }
            ]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          success: true,
          response: {
            form_id: 'OGhjJKF5LRmo',
            answers: [
              {
                question_id: 'q1',
                value: 'good'
              }
            ]
          }
        }
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    // Verify that detectLanguageWithLLM was called because language is 'Default'
    expect(detectLanguageWithLLM).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining(DISCLAIMER_MSG_FORM)
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should summarize multiple forms with real OpenAI using Text Paragraph format in French', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'French',
      },
      settings: {}
    })

    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [{
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'Test Form',
              type: 'FORM'
            },
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }]
        }
      })
      .mockResolvedValueOnce({
        form: {
          success: true,
          form: {
            id: 'OGhjJKF5LRmo',
            title: 'Health Assessment Form',
            questions: [
              {
                id: 'q1',
                title: 'How would you rate your overall health?',
                type: 'SELECT',
                options: [
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' }
                ]
              }
            ]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          success: true,
          response: {
            form_id: 'OGhjJKF5LRmo',
            answers: [
              {
                question_id: 'q1',
                value: 'good'
              }
            ]
          }
        }
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    // Verify that detectLanguageWithLLM was NOT called because a specific language (French) was provided
    expect(detectLanguageWithLLM).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('Avis Important')
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should detect Spanish language from Spanish form content', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default', // Set to Default to trigger language detection
      },
      settings: {}
    })

    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [{
            id: 'X74HeDQ4N0gtdaSEuzF8s',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'Formulario de Evaluación de Salud',
              type: 'FORM'
            },
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }]
        }
      })
      .mockResolvedValueOnce({
        form: {
          success: true,
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
                  { value: 'bueno', label: 'Bueno' }
                ]
              }
            ]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          success: true,
          response: {
            form_id: 'OGhjJKF5LRmo',
            answers: [
              {
                question_id: 'q1',
                value: 'bueno'
              }
            ]
          }
        }
      })

    helpers.awellSdk = jest.fn().mockReturnValue({
      orchestration: {
        query: mockQuery
      }
    })

    await extensionAction.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(4)
    
    // Verify detectLanguageWithLLM was called
    expect(detectLanguageWithLLM).toHaveBeenCalled()
    
    // The summary should contain Spanish disclaimer
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringContaining('Aviso Importante')
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)
})
