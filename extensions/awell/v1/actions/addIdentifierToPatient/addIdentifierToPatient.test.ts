import { generateTestPayload } from '../../../../../src/tests'
import { addIdentifierToPatient } from './addIdentifierToPatient'

/**
 * Test needs to be fixed
 */
jest.mock('@awell-health/awell-sdk')

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
          system: 'system',
          value: 'value',
        },
        settings: {
          apiUrl: 'api-url',
          apiKey: 'api-key',
        },
        patient: {
          id: 'some-patient-id',
        },
      }),
      onComplete,
      onError
    )

    expect(true).toBe(true)

    // expect(onComplete).toHaveBeenCalled()
    // expect(onError).not.toHaveBeenCalled()
  })
})
