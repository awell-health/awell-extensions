import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeForm } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'
import { mockFormDefinitionResponse } from './__mocks__/formDefinitionResponse'
import { mockFormResponseResponse } from './__mocks__/formResponseResponse'

describe('Shelly - Summarize', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeForm)

  const awellSdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
      query: jest.fn().mockResolvedValue({
        pathwayActivities: mockPathwayActivitiesResponse,
        form: mockFormDefinitionResponse,
        formResponse: mockFormResponseResponse,
      }),
    },
  }

  helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'ai4rZaYEocjB',
          definition_id: 'whatever',
        },
        activity: { id: 'X74HeDQ4N0gtdaSEuzF8s' },
        patient: { id: 'whatever' },
        fields: {
          prompt: '',
        },
        settings: {
          openAiApiKey: 'a',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary:
          '"Question label: Single select (number)\\nQuestion type: MULTIPLE_CHOICE\\nPossible answers:\\n- Option 1 (0)\\n- Option 2 (1)\\n- Option 3 (2)\\nAnswer: Option 1\\n\\n----------------\\n\\nQuestion label: Single select (string)\\nQuestion type: MULTIPLE_CHOICE\\nPossible answers:\\n- Option 1 (option_1)\\n- Option 2 (option_2)\\n- Option 3 (option_3)\\nAnswer: Option 1\\n\\n----------------\\n\\nQuestion label: Multiple select (number)\\nQuestion type: MULTIPLE_SELECT\\nPossible answers:\\n- Option 1 (0)\\n- Option 2 (1)\\n- Option 3 (2)\\nAnswers:\\n- Option 1\\n- Option 2\\n\\n----------------\\n\\nQuestion label: Multiple select (string)\\nQuestion type: MULTIPLE_SELECT\\nPossible answers:\\n- Option 1 (option_1)\\n- Option 2 (option_2)\\n- Option 3 (option_3)\\nAnswers:\\n- Option 1\\n- Option 2\\n\\n----------------\\n\\nQuestion label: Yes or no? (boolean)\\nQuestion type: YES_NO\\nAnswer: Yes\\n\\n----------------\\n\\nQuestion label: Slider\\nQuestion type: SLIDER\\nAnswer: 5\\n\\n----------------\\n\\nQuestion label: Date\\nQuestion type: DATE\\nAnswer: 2024-09-17T00:00:00.000Z\\n\\n----------------\\n\\nQuestion label: Email\\nQuestion type: EMAIL\\nAnswer: nick@awellhealth.com\\n\\n----------------\\n\\nQuestion label: Question that collects a numeric value\\nQuestion type: NUMBER\\nAnswer: 1\\n\\n----------------\\n\\nQuestion label: Question that collects a sstring value\\nQuestion type: SHORT_TEXT\\nAnswer: A short answer\\n\\n----------------\\n\\nQuestion label: Question that collects a string but long-form (textarea)\\nQuestion type: LONG_TEXT\\nAnswer: A long text\\n\\nNew paragraph\\n\\n----------------\\n\\nQuestion label: Question that collects a phone number\\nQuestion type: TELEPHONE\\nAnswer: +32476581696"',
      },
    })
  })
})
