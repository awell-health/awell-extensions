import { AwellSdk } from '@awell-health/awell-sdk'
import { generateTestPayload } from '../../../../../src/tests'
import { addIdentifierToPatient } from './addIdentifierToPatient'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@awell-health/awell-sdk')

describe('Add identifier to patient', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(addIdentifierToPatient)

  beforeEach(() => {
    clearMocks()
  })

  describe('No patient with the provided identifier system and value exists', () => {
    describe('Current patient does already have an identifier of the same system but a different value', () => {
      test('Should update the provided identifier system with the new identifier value', async () => {
        /**
         * Mocking the SDK's response to simulate a scenario where the current patient
         * already has an identifier with the same system but a different value
         */
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: 'some-patient-id',
                  profile: {
                    identifier: [
                      {
                        system: 'https://www.system.com/',
                        value: 'existingIdentifierValue',
                      },
                    ],
                  },
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate an event where a new identifier value is provided for an existing system
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              system: 'https://www.system.com/',
              value: 'identifier-value',
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

        expect(onComplete).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'The patient already had an identifier with system https://www.system.com/ and value existingIdentifierValue. The identifier value has been updated to identifier-value.',
              },
            },
          ],
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('Current patient does not have an identifier of the same system', () => {
      test('Should add the provided identifier system and value to the patient', async () => {
        /**
         * Mocking the SDK's response to simulate a scenario where the current patient
         * does not have an identifier of the same system (but could have an identifier of a different system)
         */
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: 'some-patient-id',
                  profile: {
                    identifier: [
                      {
                        system: 'https://www.another-system.com/',
                        value: 'value',
                      },
                    ],
                  },
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate an event where a new identifier system and value is provided
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              system: 'https://www.system.com/',
              value: 'newIdentifierValue',
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

        expect(onComplete).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'The identifier with system https://www.system.com/ and value newIdentifierValue has been added to the patient.',
              },
            },
          ],
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })
  })

  describe('A patient with the provided identifier system and value already exists', () => {
    describe('Existing patient is the current patient', () => {
      describe('The new identifier value is the same as the existing value', () => {
        test('It should not update the patient', async () => {
          /**
           * Mocking the SDK's response to simulate a scenario where the current patient
           * already has an identifier of the same system and value
           */
          const awellSdkMock = {
            orchestration: {
              mutation: jest.fn().mockResolvedValue({}),
              query: jest.fn().mockResolvedValue({
                patientByIdentifier: {
                  patient: {
                    id: 'some-patient-id',
                    profile: {
                      identifier: [
                        {
                          system: 'https://www.system.com/',
                          value: 'existingIdentifierValue',
                        },
                      ],
                    },
                  },
                },
              }),
            },
          }

          helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

          // Simulate an event where an existing identifier system is updated to the same value
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                system: 'https://www.system.com/',
                value: 'existingIdentifierValue', // The new value is equal to the existing value
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

          expect(onComplete).toHaveBeenCalledWith({
            events: [
              {
                date: expect.any(String),
                text: {
                  en: 'Patient already had an identifier of the same value and system. No changes were made.',
                },
              },
            ],
          })
          expect(onError).not.toHaveBeenCalled()
        })
      })

      describe('The new identifier value is different from the existing value', () => {
        test('It should update the identifier to the new value', async () => {
          /**
           * Mocking the SDK's response to simulate a scenario where the current patient
           * already has an identifier of the same system and value
           */
          const awellSdkMock = {
            orchestration: {
              mutation: jest.fn().mockResolvedValue({}),
              query: jest.fn().mockResolvedValue({
                patientByIdentifier: {
                  patient: {
                    id: 'some-patient-id',
                    profile: {
                      identifier: [
                        {
                          system: 'https://www.system.com/',
                          value: 'existingIdentifierValue',
                        },
                      ],
                    },
                  },
                },
              }),
            },
          }

          helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

          // Simulate an event where an existing identifier system is updated to a new value
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                system: 'https://www.system.com/',
                value: 'newIdentifierValue', // The new value is different from the existing value
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

          expect(onComplete).toHaveBeenCalledWith({
            events: [
              {
                date: expect.any(String),
                text: {
                  en: 'The patient already had an identifier with system https://www.system.com/ and value existingIdentifierValue. The identifier value has been updated to newIdentifierValue.',
                },
              },
            ],
          })
          expect(onError).not.toHaveBeenCalled()
        })
      })
    })

    describe('Existing patient is not the current patient', () => {
      test('It should throw an error', async () => {
        /**
         * Mocking the SDK's response to simulate a scenario where another patient
         * already has an identifier of the same system and value
         */
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: 'some-patient-id',
                  profile: {
                    identifier: [
                      {
                        system: 'https://www.system.com/',
                        value: 'existingIdentifierValue',
                      },
                    ],
                  },
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate an event where the action is executed for a patient different from the current one
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              system: 'https://www.system.com/',
              value: 'newIdentifierValue',
            },
            settings: {},
            patient: {
              id: 'another-patient-id', // Different patient
            },
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'Another patient (some-patient-id) already has an identifier with system https://www.system.com/ and value newIdentifierValue. Adding this identifier to the current patient is not possible.',
              },
            },
          ],
        })
        expect(onComplete).not.toHaveBeenCalled()
      })
    })
  })

  describe('When the patient has multiple identifiers', () => {
    test('We should PATCH the new identifier and not remove existing ones', async () => {
      // Mocking the SDK's response for an existing patient with multiple identifiers
      const awellSdkMock = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest.fn().mockResolvedValue({
            patientByIdentifier: {
              patient: {
                id: 'some-patient-id',
                profile: {
                  identifier: [
                    {
                      system: 'https://www.system-1.com/',
                      value: 'value-1',
                    },
                    {
                      system: 'https://www.system-2.com/',
                      value: 'value-2', // Identifier we want to update
                    },
                    {
                      system: 'https://www.system-3.com/',
                      value: 'value-3',
                    },
                  ],
                },
              },
            },
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      // Simulate an event where a new identifier value is provided for an existing system
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            system: 'https://www.system-2.com/',
            value: 'newIdentifierValue',
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

      expect(awellSdkMock.orchestration.mutation).toHaveBeenCalledWith({
        updatePatient: {
          __args: {
            input: {
              patient_id: 'some-patient-id',
              profile: {
                identifier: [
                  // Retain existing identifiers that aren't being updated
                  {
                    system: 'https://www.system-1.com/',
                    value: 'value-1',
                  },
                  {
                    system: 'https://www.system-3.com/',
                    value: 'value-3',
                  },
                  // Update the identifier with the matching system to the new value
                  {
                    system: 'https://www.system-2.com/',
                    value: 'newIdentifierValue',
                  },
                ],
              },
            },
          },
          patient: expect.any(Object),
        },
      })
    })
  })
})
