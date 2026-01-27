import { AwellSdk } from '@awell-health/awell-sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import { listFormAnswers as actionInterface } from '.'
import {
  mockFormDefinitionResponse,
  mockFormResponseResponse,
} from './__testdata__'

describe('listFormAnswers', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  const createAwellSdkMock = () => ({
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
      query: jest
        .fn()
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
        .mockResolvedValueOnce({
          pathwayStepActivities: {
            success: true,
            activities: [
              {
                id: 'X74HeDQ4N0gtdaSEuzF8s',
                status: 'DONE',
                date: '2024-09-11T22:56:58.607Z',
                object: {
                  id: 'OGhjJKF5LRmo',
                  name: 'Test Form',
                  type: 'FORM',
                },
                context: {
                  step_id: 'Xkn5dkyPA5uW',
                },
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          form: mockFormDefinitionResponse,
        })
        .mockResolvedValueOnce({
          formResponse: mockFormResponseResponse,
        }),
    },
    /**
     * Utilities don't need to be mocked so we'll just add them back in here
     */
    utils: new AwellSdk({
      environment: 'sandbox',
      apiKey: 'sth',
    }).utils,
  })

  beforeEach(() => {
    clearMocks()
  })

  describe('Scope: Step, Selection: Latest (default)', () => {
    test('Should call onComplete with form answers when form is found', async () => {
      helpers.awellSdk = jest.fn().mockResolvedValue(createAwellSdkMock())
      await action.onEvent({
        payload: {
          pathway: {
            id: '5eN4qWbxZGSA',
          },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Step',
            formSelection: 'Latest',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: `Single select (number):
Option 1

Single select (string):
Option 1

Multiple select (number):
- Option 1
- Option 2

Multiple select (string):
- Option 1
- Option 2

Yes or no? (boolean):
Yes

Slider:
5

Date:
9/17/2024

Email:
nick@awellhealth.com

Question that collects a numeric value:
1

Question that collects a sstring value:
A short answer

Question that collects a string but long-form (textarea):
A long text

New paragraph

Question that collects a phone number:
+32476581696`,
          numberOfFormsCaptured: '1',
        },
        events: expect.any(Array),
      })
    })

    test('Should use custom separator between questions when provided', async () => {
      helpers.awellSdk = jest.fn().mockResolvedValue(createAwellSdkMock())
      await action.onEvent({
        payload: {
          pathway: {
            id: '5eN4qWbxZGSA',
          },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Step',
            formSelection: 'Latest',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
            separator: '---',
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: `Single select (number):
Option 1

---

Single select (string):
Option 1

---

Multiple select (number):
- Option 1
- Option 2

---

Multiple select (string):
- Option 1
- Option 2

---

Yes or no? (boolean):
Yes

---

Slider:
5

---

Date:
9/17/2024

---

Email:
nick@awellhealth.com

---

Question that collects a numeric value:
1

---

Question that collects a sstring value:
A short answer

---

Question that collects a string but long-form (textarea):
A long text

New paragraph

---

Question that collects a phone number:
+32476581696`,
          numberOfFormsCaptured: '1',
        },
        events: expect.any(Array),
      })
    })

    test('Should call onComplete with "(No form response)" when no form is found in current step', async () => {
      const awellSdkMockNoForm = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest
            .fn()
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
            .mockResolvedValueOnce({
              pathwayStepActivities: {
                success: true,
                activities: [], // No form activities in the step
              },
            }),
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockNoForm)

      await action.onEvent({
        payload: {
          pathway: {
            id: '5eN4qWbxZGSA',
          },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Step',
            formSelection: 'Latest',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: '(No form response)',
          numberOfFormsCaptured: '0',
        },
        events: expect.any(Array),
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('Scope: Step, Selection: All', () => {
    test('Should return all forms in the step', async () => {
      const mockQuery = jest.fn().mockImplementation((query) => {
        // Handle activity query
        if (query.activity) {
          return Promise.resolve({
            activity: {
              success: true,
              activity: {
                id: 'X74HeDQ4N0gtdaSEuzF8s',
                status: 'DONE',
                date: '2024-09-11T22:56:59.607Z',
                object: { id: 'obj1', type: 'ACTION' },
                context: { step_id: 'Xkn5dkyPA5uW' },
              },
            },
          })
        }
        // Handle pathwayStepActivities query
        if (query.pathwayStepActivities) {
          return Promise.resolve({
            pathwayStepActivities: {
              success: true,
              activities: [
                {
                  id: 'form-activity-1',
                  status: 'DONE',
                  date: '2024-09-11T22:56:57.607Z',
                  object: { id: 'form-1', type: 'FORM' },
                  context: { step_id: 'Xkn5dkyPA5uW' },
                },
                {
                  id: 'form-activity-2',
                  status: 'DONE',
                  date: '2024-09-11T22:56:58.607Z',
                  object: { id: 'form-2', type: 'FORM' },
                  context: { step_id: 'Xkn5dkyPA5uW' },
                },
              ],
            },
          })
        }
        // Handle form query
        if (query.form) {
          const formId = query.form.__args.id
          if (formId === 'form-1') {
            return Promise.resolve({
              form: {
                form: {
                  title: 'Form One',
                  questions: [
                    {
                      id: 'q1',
                      title: 'Question 1',
                      key: 'question1',
                      userQuestionType: 'SHORT_TEXT',
                      options: [],
                    },
                  ],
                },
              },
            })
          }
          if (formId === 'form-2') {
            return Promise.resolve({
              form: {
                form: {
                  title: 'Form Two',
                  questions: [
                    {
                      id: 'q2',
                      title: 'Question 2',
                      key: 'question2',
                      userQuestionType: 'SHORT_TEXT',
                      options: [],
                    },
                  ],
                },
              },
            })
          }
        }
        // Handle formResponse query
        if (query.formResponse) {
          const activityId = query.formResponse.__args.activity_id
          if (activityId === 'form-activity-1') {
            return Promise.resolve({
              formResponse: {
                response: {
                  answers: [{ question_id: 'q1', value: 'Answer 1' }],
                },
              },
            })
          }
          if (activityId === 'form-activity-2') {
            return Promise.resolve({
              formResponse: {
                response: {
                  answers: [{ question_id: 'q2', value: 'Answer 2' }],
                },
              },
            })
          }
        }
        return Promise.reject(new Error('Unexpected query'))
      })

      const awellSdkMockMultipleForms = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: mockQuery,
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockMultipleForms)

      await action.onEvent({
        payload: {
          pathway: { id: '5eN4qWbxZGSA' },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Step',
            formSelection: 'All',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: `=== Form One ===

Question 1:
Answer 1

=== Form Two ===

Question 2:
Answer 2`,
          numberOfFormsCaptured: '2',
        },
        events: expect.any(Array),
      })
    })
  })

  describe('Scope: Track, Selection: Latest', () => {
    test('Should return only the latest form in the track', async () => {
      const mockQuery = jest.fn().mockImplementation((query) => {
        // Handle activity query
        if (query.activity) {
          return Promise.resolve({
            activity: {
              success: true,
              activity: {
                id: 'X74HeDQ4N0gtdaSEuzF8s',
                date: '2024-09-11T22:56:59.607Z',
                context: {
                  track_id: 'track-123',
                },
              },
            },
          })
        }
        // Handle pathwayActivities query (for track)
        if (query.pathwayActivities) {
          return Promise.resolve({
            pathwayActivities: {
              success: true,
              activities: [
                {
                  id: 'form-activity-1',
                  status: 'DONE',
                  date: '2024-09-11T22:56:57.607Z',
                  object: { id: 'form-1', name: 'First Form', type: 'FORM' },
                },
                {
                  id: 'form-activity-2',
                  status: 'DONE',
                  date: '2024-09-11T22:56:58.607Z',
                  object: { id: 'form-2', name: 'Second Form', type: 'FORM' },
                },
              ],
            },
          })
        }
        // Handle form query
        if (query.form) {
          return Promise.resolve({
            form: {
              form: {
                title: 'First Form',
                questions: [
                  {
                    id: 'q1',
                    title: 'Question',
                    key: 'question',
                    userQuestionType: 'SHORT_TEXT',
                    options: [],
                  },
                ],
              },
            },
          })
        }
        // Handle formResponse query
        if (query.formResponse) {
          return Promise.resolve({
            formResponse: {
              response: {
                answers: [{ question_id: 'q1', value: 'Track Answer' }],
              },
            },
          })
        }
        return Promise.reject(new Error('Unexpected query'))
      })

      const awellSdkMockTrack = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: mockQuery,
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockTrack)

      await action.onEvent({
        payload: {
          pathway: { id: '5eN4qWbxZGSA' },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Track',
            formSelection: 'Latest',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: `Question:
Track Answer`,
          numberOfFormsCaptured: '1',
        },
        events: expect.any(Array),
      })
    })
  })

  describe('Scope: Track, Selection: All', () => {
    test('Should return all forms in the track', async () => {
      const mockQuery = jest.fn().mockImplementation((query) => {
        // Handle activity query
        if (query.activity) {
          return Promise.resolve({
            activity: {
              success: true,
              activity: {
                id: 'X74HeDQ4N0gtdaSEuzF8s',
                date: '2024-09-11T22:56:59.607Z',
                context: {
                  track_id: 'track-123',
                },
              },
            },
          })
        }
        // Handle pathwayActivities query (for track)
        if (query.pathwayActivities) {
          return Promise.resolve({
            pathwayActivities: {
              success: true,
              activities: [
                {
                  id: 'form-activity-1',
                  status: 'DONE',
                  date: '2024-09-11T22:56:57.607Z',
                  object: { id: 'form-1', name: 'First Form', type: 'FORM' },
                },
                {
                  id: 'form-activity-2',
                  status: 'DONE',
                  date: '2024-09-11T22:56:58.607Z',
                  object: { id: 'form-2', name: 'Second Form', type: 'FORM' },
                },
              ],
            },
          })
        }
        // Handle form query
        if (query.form) {
          const formId = query.form.__args.id
          if (formId === 'form-1') {
            return Promise.resolve({
              form: {
                form: {
                  title: 'First Form',
                  questions: [
                    {
                      id: 'q1',
                      title: 'Q1',
                      key: 'q1',
                      userQuestionType: 'SHORT_TEXT',
                      options: [],
                    },
                  ],
                },
              },
            })
          }
          if (formId === 'form-2') {
            return Promise.resolve({
              form: {
                form: {
                  title: 'Second Form',
                  questions: [
                    {
                      id: 'q2',
                      title: 'Q2',
                      key: 'q2',
                      userQuestionType: 'SHORT_TEXT',
                      options: [],
                    },
                  ],
                },
              },
            })
          }
        }
        // Handle formResponse query
        if (query.formResponse) {
          const activityId = query.formResponse.__args.activity_id
          if (activityId === 'form-activity-1') {
            return Promise.resolve({
              formResponse: {
                response: {
                  answers: [{ question_id: 'q1', value: 'A1' }],
                },
              },
            })
          }
          if (activityId === 'form-activity-2') {
            return Promise.resolve({
              formResponse: {
                response: {
                  answers: [{ question_id: 'q2', value: 'A2' }],
                },
              },
            })
          }
        }
        return Promise.reject(new Error('Unexpected query'))
      })

      const awellSdkMockTrackAll = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: mockQuery,
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockTrackAll)

      await action.onEvent({
        payload: {
          pathway: { id: '5eN4qWbxZGSA' },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Track',
            formSelection: 'All',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: `=== First Form ===

Q1:
A1

=== Second Form ===

Q2:
A2`,
          numberOfFormsCaptured: '2',
        },
        events: expect.any(Array),
      })
    })

    test('Should return no form response when track has no forms', async () => {
      const awellSdkMockTrackNoForms = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest
            .fn()
            .mockResolvedValueOnce({
              activity: {
                success: true,
                activity: {
                  id: 'X74HeDQ4N0gtdaSEuzF8s',
                  date: '2024-09-11T22:56:59.607Z',
                  context: {
                    track_id: 'track-123',
                  },
                },
              },
            })
            .mockResolvedValueOnce({
              pathwayActivities: {
                success: true,
                activities: [], // No forms in track
              },
            }),
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockTrackNoForms)

      await action.onEvent({
        payload: {
          pathway: { id: '5eN4qWbxZGSA' },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Track',
            formSelection: 'All',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          output: '(No form response)',
          numberOfFormsCaptured: '0',
        },
        events: expect.any(Array),
      })
    })
  })

  describe('Error handling', () => {
    test('Should call onError when an unexpected error occurs', async () => {
      const awellSdkMockError = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest.fn().mockRejectedValue(new Error('Network error')),
        },
        utils: new AwellSdk({
          environment: 'sandbox',
          apiKey: 'sth',
        }).utils,
      }
      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMockError)

      await action.onEvent({
        payload: {
          pathway: {
            id: '5eN4qWbxZGSA',
          },
          activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
          patient: { id: 'whatever' },
          fields: {
            scope: 'Step',
            formSelection: 'Latest',
            language: 'English',
            includeDescriptions: false,
            includeMissingAnswers: false,
          },
          settings: {},
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              en: expect.stringContaining('Error: Network error'),
            }),
          }),
        ]),
      })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
