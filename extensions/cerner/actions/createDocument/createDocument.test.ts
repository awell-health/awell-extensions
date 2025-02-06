import { TestHelpers } from '@awell-health/extensions-core'
import { createDocument as action } from './createDocument'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { CreateDocumentMockResponse } from './__testdata__/CreateDocument.mock'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Create document', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    const mockCreateDocument = jest
      .fn()
      .mockResolvedValue(CreateDocumentMockResponse)
    const mockedCernerClient = jest.mocked(CernerR4APIClient)

    mockedCernerClient.mockImplementation(() => {
      return {
        createDocumentReference: mockCreateDocument,
      } as unknown as CernerR4APIClient
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          patientResourceId: 'patient-resource-id',
          encounterResourceId: 'encounter-resource-id',
          type: 'Progress Note',
          note: 'This is a test note',
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
        resourceId: '207359710',
      },
    })
  })
})
