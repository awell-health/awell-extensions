import { TestHelpers } from '@awell-health/extensions-core'
import { matchPatient as action } from './matchPatient'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { FhirPatientMatch, FhirPatientNoMatch } from './__testdata__/'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Match patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When a match is found', () => {
    test('Should work', async () => {
      const mockMatchPatient = jest
        .fn()
        .mockResolvedValue({ data: FhirPatientMatch })
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          matchPatient: mockMatchPatient,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            familyName: 'Test',
            givenName: 'Nick',
            email: 'nick@awellhealth.com',
            gender: 'male',
            birthDate: '1993-11-30',
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
          resourceId: 'ePYvjhzgI56-88pdl89yRRQ3',
        },
      })
    })
  })

  describe('When no match is found', () => {
    test('Should throw an error', async () => {
      const mockMatchPatient = jest
        .fn()
        .mockResolvedValue({ data: FhirPatientNoMatch })
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          matchPatient: mockMatchPatient,
        } as unknown as EpicFhirR4Client
      })

      await expect(
        extensionAction.onEvent({
          payload: {
            fields: {
              familyName: 'Test',
              givenName: 'Nick',
              email: 'nick@awellhealth.com',
              gender: 'male',
              birthDate: '1993-11-30',
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
      ).rejects.toThrow('No match found')
    })
  })
})
