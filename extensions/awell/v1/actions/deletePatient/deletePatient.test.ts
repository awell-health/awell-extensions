import { generateTestPayload } from '../../../../../src/tests'
import { deletePatient } from './deletePatient'

jest.mock('../../sdk/awellSdk')

describe('Update patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await deletePatient.onActivityCreated(
      generateTestPayload({
        fields: {},
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
