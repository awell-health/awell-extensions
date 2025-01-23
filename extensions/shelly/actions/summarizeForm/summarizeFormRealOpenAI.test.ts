import 'dotenv/config'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { DISCLAIMER_MSG_FORM } from '../../lib/constants'

jest.setTimeout(30000) // Increase timeout if needed for real LLM calls

describe.skip('summarizeForm - Real LLM calls with mocked Awell SDK', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

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

  it('Should call the real model with Bullet-points format', async () => {
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
          activity: mockPathwayActivitiesResponse.activities[0]
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: mockPathwayActivitiesResponse.activities
        }
      })
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [{
              id: 'q1',
              title: 'Test Question',
              type: 'TEXT',
              options: []
            }]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [{
              question_id: 'q1',
              value: 'Test Answer'
            }]
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
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(
          new RegExp(`${DISCLAIMER_MSG_FORM}.*Test Question.*Test Answer.*`, 's')
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model with Text paragraph format', async () => {
    const payload = generateTestPayload({
      pathway: {
        id: 'ai4rZaYEocjB',
        definition_id: 'whatever',
      },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'Default',
      },
      settings: {}
    })

    const mockQuery = jest.fn()
      // First query: get current activity
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
            date: '2024-09-11T22:56:59.607Z',
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }
        }
      })
      // Second query: get activities in current step
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: [{
            id: 'form_activity_id',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'General Dummy Form',
              type: 'FORM'
            },
            context: {
              step_id: 'Xkn5dkyPA5uW'
            }
          }]
        }
      })
      // Third query: get form definition
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [{
              id: 'q1',
              title: 'Test Question',
              type: 'TEXT',
              options: []
            }]
          }
        }
      })
      // Fourth query: get form response
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [{
              question_id: 'q1',
              value: 'Test Answer'
            }]
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
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(
          new RegExp(`${DISCLAIMER_MSG_FORM}.*Test Question.*Test Answer.*`, 's')
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model and use mocked form data with Text paragraph format', async () => {
    const payload = generateTestPayload({
      pathway: { id: 'ai4rZaYEocjB', definition_id: 'whatever' },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Text paragraph',
        language: 'Default',
      },
      settings: {}
    })

    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: {
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
            id: 'form_activity_id',
            status: 'DONE',
            date: '2024-09-11T22:56:58.607Z',
            object: {
              id: 'OGhjJKF5LRmo',
              name: 'General Dummy Form',
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
          form: {
            id: 'OGhjJKF5LRmo',
            questions: [{
              id: 'q1',
              title: 'Test Question',
              type: 'TEXT',
              options: []
            }]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [{
              question_id: 'q1',
              value: 'Test Answer'
            }]
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
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(
          new RegExp(`${DISCLAIMER_MSG_FORM}.*Test Question.*Test Answer.*`, 's')
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)

  it('Should call the real model and use mocked form data', async () => {
    const payload = generateTestPayload({
      pathway: { id: 'ai4rZaYEocjB', definition_id: 'whatever' },
      activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
      fields: {
        summaryFormat: 'Bullet-points',
        language: 'Default',
      },
      settings: {
        openAiApiKey: process.env.OPENAI_API_KEY,
      }
    })

    const mockQuery = jest.fn()
      .mockResolvedValueOnce({
        activity: {
          success: true,
          activity: mockPathwayActivitiesResponse.activities[0]
        }
      })
      .mockResolvedValueOnce({
        pathwayStepActivities: {
          success: true,
          activities: mockPathwayActivitiesResponse.activities
        }
      })
      .mockResolvedValueOnce({
        form: {
          form: {
            id: 'OGhjJKF5LRmo',
            title: 'Patient Health Questionnaire',
            questions: [
              {
                id: 'q1',
                title: 'How would you rate your overall health?',
                type: 'SELECT',
                options: [
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' }
                ]
              },
              {
                id: 'q2',
                title: 'What symptoms have you experienced in the last 7 days?',
                type: 'MULTIPLE_SELECT',
                options: [
                  { value: 'fatigue', label: 'Fatigue' },
                  { value: 'headache', label: 'Headache' },
                  { value: 'fever', label: 'Fever' },
                  { value: 'cough', label: 'Cough' },
                  { value: 'none', label: 'None of the above' }
                ]
              },
              {
                id: 'q3',
                title: 'Please describe any other health concerns:',
                type: 'TEXT',
                options: []
              }
            ]
          }
        }
      })
      .mockResolvedValueOnce({
        formResponse: {
          response: {
            answers: [
              {
                question_id: 'q1',
                value: 'good'
              },
              {
                question_id: 'q2',
                value: ['fatigue', 'headache']
              },
              {
                question_id: 'q3',
                value: 'I have been experiencing occasional dizziness when standing up too quickly.'
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
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: expect.stringMatching(
          new RegExp(`${DISCLAIMER_MSG_FORM}.*Patient Health Questionnaire.*Overall health.*Symptoms.*health concerns.*`, 's')
        ),
      },
    })
    expect(onError).not.toHaveBeenCalled()
  }, 30000)
})
