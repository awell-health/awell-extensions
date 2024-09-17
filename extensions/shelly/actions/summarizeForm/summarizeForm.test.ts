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
          "\"What's the patient's last name?\\nHellemans\\n\\nWhat's the patient's date of birth?\\n1993-11-30T00:00:00.000Z\\n\\nWhat's the patient's first name?\\nNick\\n\\nPlease provide the patient's NHS Number:\\n123\\n\\nHow often do you have a drink containing alcohol?\\nNever\"",
      },
    })
  })
})
