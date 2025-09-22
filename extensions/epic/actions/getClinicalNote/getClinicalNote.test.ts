import { TestHelpers } from '@awell-health/extensions-core'
import { getClinicalNote as action } from './getClinicalNote'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { GetDocumentReferenceMockResponse } from './__testdata__/GetDocumentReference.mock'
import { GetBinaryMockResponse } from './__testdata__/GetBinary.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Get clinical note', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the clinical note is found', () => {
    test('Should return the clinical note', async () => {
      const mockGetDocumentReference = jest
        .fn()
        .mockResolvedValue(GetDocumentReferenceMockResponse)
      const mockGetBinary = jest
        .fn()
        .mockResolvedValue(GetBinaryMockResponse)
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getDocumentReference: mockGetDocumentReference,
          getBinary: mockGetBinary,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
            authUrl:
              'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            clientId: 'client-id',
            privateKey: `-----BEGIN PRIVATE KEY-----`,
            kid: 'kid',
            jku: 'jku',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          documentReference: JSON.stringify(GetDocumentReferenceMockResponse.data),
          binary: JSON.stringify(GetBinaryMockResponse.data),
        },
      })
    })
  })

  describe('When the document reference is not found', () => {
    test('Should return an error', async () => {
      const mockGetDocumentReference = jest
        .fn()
        .mockRejectedValue(
          createAxiosError(404, 'Not Found', JSON.stringify({})),
        )
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getDocumentReference: mockGetDocumentReference,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
            authUrl:
              'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            clientId: 'client-id',
            privateKey: `-----BEGIN PRIVATE KEY-----`,
            kid: 'kid',
            jku: 'jku',
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
            text: { en: 'Document reference not found' },
          },
        ],
      })
    })
  })
})
