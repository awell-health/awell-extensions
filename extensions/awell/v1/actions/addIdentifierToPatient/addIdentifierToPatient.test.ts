import { generateTestPayload } from '../../../../../src/tests'
import AwellSdk from '../../sdk/awellSdk'
import { addIdentifierToPatient } from './addIdentifierToPatient'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'addIdentifierToPatient')
  .mockImplementationOnce(jest.fn().mockResolvedValue(true))

describe('Add identifier to patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await addIdentifierToPatient.onActivityCreated(
      generateTestPayload({
        fields: {
          system: 'https://www.awellhealth.com/',
          value: '123',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
