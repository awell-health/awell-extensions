import { generateTestPayload } from '../../../../../tests'
import { addIdentifierToPatient } from './addIdentifierToPatient'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@awell-health/awell-sdk')

describe('Add identifier to patient', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(addIdentifierToPatient)

  beforeEach(() => {
    clearMocks()
  })

  describe('When no other patient has the provided identifier system and value', () => {
    /**
     * Patient lookup yields no results, meaning no existing patient has the identifier with the specified system and value
     */
    describe('If the current patient already has an identifier with the same system but a different value', () => {
      test('Updates the existing identifier with the new value', async () => {
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: null, // No patient found with this identifier
                },
              },
              patient: {
                patient: {
                  profile: {
                    identifier: [
                      {
                        system: 'https://www.system.com/',
                        value: 'existingIdentifierValue', // Existing identifier on current patient
                      },
                    ],
                  },
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate updating an existing identifier value for a given system
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
          events: expect.arrayContaining([
            {
              date: expect.any(String),
              text: {
                en: 'The patient already had an identifier with system https://www.system.com/ and value existingIdentifierValue. The identifier value has been updated to newIdentifierValue.',
              },
            },
          ]),
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('If the current patient does not have an identifier with the same system', () => {
      test('Adds the new identifier to the patient', async () => {
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: null, // No patient found with this identifier
                },
              },
              patient: {
                patient: {
                  profile: {
                    identifier: [], // No existing identifiers for this patient
                  },
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate adding a new identifier system and value
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              system: 'https://www.system.com/',
              value: 'identifierValue',
            },
            settings: {},
            patient: {
              id: 'some-patient-id',
              profile: {
                identifier: [],
              },
            },
          }),
          onComplete,
          onError,
          helpers,
        })

        expect(onComplete).toHaveBeenCalledWith({
          events: expect.arrayContaining([
            {
              date: expect.any(String),
              text: {
                en: 'The identifier with system https://www.system.com/ and value identifierValue has been added to the patient.',
              },
            },
          ]),
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })
  })

  describe('When a patient with the provided identifier system and value already exists', () => {
    describe('If the existing patient is the current patient', () => {
      describe('If the new identifier value is the same as the existing value', () => {
        test('Makes no updates if the identifier value is unchanged', async () => {
          /**
           * Mocks SDK response to simulate an existing identifier for the current patient
           */
          const awellSdkMock = {
            orchestration: {
              mutation: jest.fn().mockResolvedValue({}),
              query: jest.fn().mockResolvedValue({
                patientByIdentifier: {
                  patient: {
                    id: 'some-patient-id', // Current patient already has the identifier
                  },
                },
                patient: {
                  patient: {
                    profile: {
                      identifier: [
                        {
                          system: 'https://www.system.com/',
                          value: 'existingIdentifierValue', // Same value as provided
                        },
                      ],
                    },
                  },
                },
              }),
            },
          }

          helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

          // Simulate no change in identifier value
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                system: 'https://www.system.com/',
                value: 'existingIdentifierValue', // Same as current value
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
            events: expect.arrayContaining([
              {
                date: expect.any(String),
                text: {
                  en: 'Patient already had an identifier of the same value and system. No changes were made.',
                },
              },
            ]),
          })
          expect(onError).not.toHaveBeenCalled()
        })
      })

      describe('If the new identifier value is different from the existing value', () => {
        test('Updates the identifier to the new value', async () => {
          const awellSdkMock = {
            orchestration: {
              mutation: jest.fn().mockResolvedValue({}),
              query: jest.fn().mockResolvedValue({
                patientByIdentifier: {
                  patient: {
                    id: 'some-patient-id', // Current patient
                  },
                },
                patient: {
                  patient: {
                    profile: {
                      identifier: [
                        {
                          system: 'https://www.system.com/',
                          value: 'existingIdentifierValue', // Old value to be updated
                        },
                      ],
                    },
                  },
                },
              }),
            },
          }

          helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

          // Simulate updating identifier to a different value
          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {
                system: 'https://www.system.com/',
                value: 'newIdentifierValue', // New value for identifier
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
            events: expect.arrayContaining([
              {
                date: expect.any(String),
                text: {
                  en: 'The patient already had an identifier with system https://www.system.com/ and value existingIdentifierValue. The identifier value has been updated to newIdentifierValue.',
                },
              },
            ]),
          })
          expect(onError).not.toHaveBeenCalled()
        })
      })
    })

    describe('If the existing patient is different from the current patient', () => {
      test('Returns an error if another patient has the identifier', async () => {
        /**
         * Mocks SDK response to simulate an identifier conflict with another patient
         */
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: {
                  id: 'some-patient-id', // Different patient already has this identifier
                },
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

        // Simulate identifier conflict with a different patient
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

  describe('When handling multiple identifiers for the patient', () => {
    test('Updates an existing identifier while retaining others', async () => {
      // Mock SDK response for a patient with multiple identifiers
      const awellSdkMock = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest.fn().mockResolvedValue({
            patientByIdentifier: {
              patient: {
                id: 'some-patient-id',
              },
            },
            patient: {
              patient: {
                profile: {
                  identifier: [
                    {
                      system: 'https://www.system-1.com/',
                      value: 'value-1', // Retained identifier
                    },
                    {
                      system: 'https://www.system-2.com/',
                      value: 'value-2', // Identifier to be updated
                    },
                    {
                      system: 'https://www.system-3.com/',
                      value: 'value-3', // Retained identifier
                    },
                  ],
                },
              },
            },
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      // Simulate updating a specific identifier in a multi-identifier list
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
                  {
                    system: 'https://www.system-1.com/',
                    value: 'value-1',
                  },
                  {
                    system: 'https://www.system-3.com/',
                    value: 'value-3',
                  },
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

    test('Adds a new identifier while retaining existing ones', async () => {
      // Mock SDK response for adding an identifier
      const awellSdkMock = {
        orchestration: {
          mutation: jest.fn().mockResolvedValue({}),
          query: jest.fn().mockResolvedValue({
            patientByIdentifier: {
              patient: {
                id: 'some-patient-id',
              },
            },
            patient: {
              patient: {
                profile: {
                  identifier: [
                    {
                      system: 'https://www.system-1.com/',
                      value: 'value-1', // Retained identifier
                    },
                  ],
                },
              },
            },
          }),
        },
      }

      helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

      // Simulate adding a new identifier while retaining existing identifiers
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            system: 'https://www.system-2.com/',
            value: 'value-2',
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
                  {
                    system: 'https://www.system-1.com/',
                    value: 'value-1',
                  },
                  {
                    system: 'https://www.system-2.com/',
                    value: 'value-2',
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
