import { generatePatientSummary } from '..'

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
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: {
          id: 'test-patient',
          profile: {
            first_name: 'Nick',
            last_name: 'Hellemans',
            birth_date: '1993-11-30',
          },
        },
        fields: {
          characteristics: '',
          language: 'English',
        },
        settings: {
          openAiApiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
