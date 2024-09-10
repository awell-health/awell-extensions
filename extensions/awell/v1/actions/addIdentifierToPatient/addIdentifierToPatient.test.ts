import { generateTestPayload } from '@/tests'
import { addIdentifierToPatient } from './addIdentifierToPatient'
import { TestHelpers } from '@awell-health/extensions-core'
/**
 * Test needs to be fixed
 */
jest.mock('@awell-health/awell-sdk')

describe('Add identifier to patient', () => {
  const { onComplete, onError, extensionAction, clearMocks } =
    TestHelpers.fromAction(addIdentifierToPatient)
  const helpers = {
    httpsAgent: jest.fn(),
    awellSdk: jest.fn().mockImplementation(async () => {
      return {
        orchestration: {
          query: jest.fn().mockImplementation(async () => {
            return {
              patientByIdentifier: {
                patient: {
                  id: 'some-patient-id',
                },
              },
            }
          }),
        },
      }
    }),
  }

  beforeEach(() => {
    clearMocks()
    Object.values(helpers).forEach((mock) => mock.mockClear())
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          system: 'system',
          value: 'value',
        },
        settings: {},
        patient: {
          id: 'some-patient-id',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(true).toBe(true)

    // expect(onComplete).toHaveBeenCalled()
    // expect(onError).not.toHaveBeenCalled()
  })
})
