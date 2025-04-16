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

  const awellSdkMock = {
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
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete', async () => {
    await action.onEvent({
      payload: {
        pathway: {
          id: '5eN4qWbxZGSA',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        patient: { id: 'whatever' },
        fields: {
          language: 'English',
          separator: '---',
          includeDescriptions: false,
          includeMissingAnswers: false,
        },
        settings: {},
      } as any,
      onComplete,
      onError,
      helpers,
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
9/17/2024, 12:00:00 AM

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
      },
      events: expect.any(Array),
    })
  })
})
