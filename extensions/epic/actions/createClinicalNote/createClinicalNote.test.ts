import { TestHelpers } from '@awell-health/extensions-core'
import { createClinicalNote as action } from './createClinicalNote'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { CreateClinicalNoteMockResponse } from './__testdata__/CreateClinicalNote.mock'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Create clinical note', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    const mockCreateClinicalNote = jest
      .fn()
      .mockResolvedValue(CreateClinicalNoteMockResponse)
    const mockedEpicClient = jest.mocked(EpicFhirR4Client)

    mockedEpicClient.mockImplementation(() => {
      return {
        createDocumentReference: mockCreateClinicalNote,
      } as unknown as EpicFhirR4Client
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientResourceId: 'patient-resource-id',
          encounterResourceId: 'encounter-resource-id',
          status: 'final',
          type: 'Consult Note',
          note: 'This is a test note',
        },
        settings: {
          baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
          authUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
          clientId: 'client-id',
          privateKey: `-----BEGIN PRIVATE KEY-----`,
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
