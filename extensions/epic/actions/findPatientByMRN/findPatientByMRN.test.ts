import { TestHelpers } from '@awell-health/extensions-core'
import { findPatientByMRN as action } from './findPatientByMRN'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { FhirPatientMatch, FhirPatientNoMatch } from './__testdata__'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Find patient by MRN', () => {
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
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          searchPatient: mockSearchPatient,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            MRN: '123456',
          },
          settings: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
            authUrl:
              'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            clientId: 'client-id',
            privateKey: `-----BEGIN PRIVATE KEY-----`,
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          resourceId: 'ehZfTJ9tsbEEtj3Gv-xzlYA3',
        },
      })
    })
  })

  describe('When no match is found', () => {
    test('Should throw an error', async () => {
      const mockSearchPatient = jest
        .fn()
        .mockResolvedValue({ data: FhirPatientNoMatch })
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          searchPatient: mockSearchPatient,
        } as unknown as EpicFhirR4Client
      })

      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              MRN: '123456',
            },
            settings: {
              baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
              authUrl:
                'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
              clientId: 'client-id',
              privateKey: `-----BEGIN PRIVATE KEY-----`,
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
