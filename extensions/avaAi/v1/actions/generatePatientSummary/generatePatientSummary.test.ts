import { generatePatientSummary } from '..'
import { generateTestPayload } from '../../../../../src/tests'

jest.mock('../../../common/sdk/openAiSdk')

describe('Generate patient summary with Open AI', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await generatePatientSummary.onActivityCreated(
      generateTestPayload({
        fields: {
          characteristics: '',
          language: 'English',
        },
        settings: {
          openAiApiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
