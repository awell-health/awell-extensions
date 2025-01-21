import { TestHelpers } from '@awell-health/extensions-core'
import { createPatient as action } from './createPatient'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { CreateFhirPatientMockResponse } from './__testdata__/CreateFhirPatient.mock'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Create patient', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    const mockCreatePatient = jest
      .fn()
      .mockResolvedValue(CreateFhirPatientMockResponse)
    const mockedEpicClient = jest.mocked(EpicFhirR4Client)

    mockedEpicClient.mockImplementation(() => {
      return {
        createPatient: mockCreatePatient,
      } as unknown as EpicFhirR4Client
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          ssn: '123-45-6789',
          familyName: 'Awell',
          givenName: 'Health',
          email: 'info@awellhealth.com',
          gender: 'female',
          birthDate: '1990-12-12',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: 'eKquahyPZlalzKHM5DZX3lA3',
      },
    })
  })
})
