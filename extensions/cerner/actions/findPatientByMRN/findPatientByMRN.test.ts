import { TestHelpers } from '@awell-health/extensions-core'
import { findPatientByMRN as action } from './findPatientByMRN'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { FhirPatientMatch, FhirPatientNoMatch } from './__testdata__'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Find patient by MRN', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When a match is found', () => {
    test('Should work', async () => {
      const mockSearchPatient = jest
        .fn()
        .mockResolvedValue({ data: FhirPatientMatch })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          searchPatient: mockSearchPatient,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            MRN: '123456',
          },
          settings: {
            tenantId: 'some-tenant-id',
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          resourceId: '13115413',
        },
      })
    })
  })

  describe('When no match is found', () => {
    test('Should throw an error', async () => {
      const mockSearchPatient = jest
        .fn()
        .mockResolvedValue({ data: FhirPatientNoMatch })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          searchPatient: mockSearchPatient,
        } as unknown as CernerR4APIClient
      })

      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              MRN: '123456',
            },
            settings: {
              tenantId: 'some-tenant-id',
              clientId: 'some-client-id',
              clientSecret: 'some-secret',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        }),
      ).rejects.toThrow('No patient found')
    })
  })
})
