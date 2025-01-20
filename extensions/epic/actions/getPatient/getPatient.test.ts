import { TestHelpers } from '@awell-health/extensions-core'
import { getPatient as action } from './getPatient'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { FhirPatient } from './__testdata__/FhirPatient.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Get patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is found', () => {
    test('Should return the patient', async () => {
      const mockGetPatient = jest.fn().mockResolvedValue({ data: FhirPatient })
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getPatient: mockGetPatient,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'ePYvjhzgI56-88pdl89yRRQ3',
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
          patient: JSON.stringify(FhirPatient),
        },
      })
    })
  })

  describe('When the patient is not found', () => {
    test('Should return an error', async () => {
      const mockGetPatient = jest
        .fn()
        .mockRejectedValue(
          createAxiosError(404, 'Not Found', JSON.stringify({})),
        )
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getPatient: mockGetPatient,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'ePYvjhzgI56-88pdl89yRRQ3',
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

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Patient not found' },
          },
        ],
      })
    })
  })
})
