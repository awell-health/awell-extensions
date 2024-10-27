import { AwellSdk } from '@awell-health/awell-sdk'
import { generateTestPayload } from '@/tests'
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
      beforeEach(() => {
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
      })

      test('Should update the provided identifier system with the new identifier value', async () => {
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
      beforeEach(() => {
        const awellSdkMock = {
          orchestration: {
            mutation: jest.fn().mockResolvedValue({}),
            query: jest.fn().mockResolvedValue({
              patientByIdentifier: {
                patient: null,
              },
            }),
          },
        }

        helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)
      })

      test('Should add the provided identifier system and value to the patient', async () => {
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
      beforeEach(() => {
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
      })

      test('It should update the existing identifier system with the new value', async () => {
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
                en: 'The patient already had an identifier with system https://www.system.com/ and value existingIdentifierValue. The identifier value has been updated to newIdentifierValue.',
              },
            },
          ],
        })
        expect(onError).not.toHaveBeenCalled()
      })
    })

    describe('Existing patient is not the current patient', () => {
      beforeEach(() => {
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
      })

      test('It should throw an error', async () => {
        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              system: 'https://www.system.com/',
              value: 'newIdentifierValue',
            },
            settings: {},
            patient: {
              id: 'another-patient-id',
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
})
