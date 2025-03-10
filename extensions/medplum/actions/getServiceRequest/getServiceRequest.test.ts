import { TestHelpers } from '@awell-health/extensions-core'
import { getServiceRequest as action } from './getServiceRequest'
import { MedplumClient } from '@medplum/core'
import { ServiceRequestMock } from './__testdata__/ServiceRequest.mock'

jest.mock('@medplum/core')

describe('Medplum - Get service request', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockReadResource = jest.fn()

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    const mockedMedplumClient = jest.mocked(MedplumClient)
    mockedMedplumClient.mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        readResource: mockReadResource,
      } as unknown as MedplumClient
    })
  })

  describe('When the ServiceRequest is found', () => {
    beforeAll(() => {
      mockReadResource.mockResolvedValue(ServiceRequestMock)
    })

    test('Should return the ServiceRequest', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: ServiceRequestMock.id,
          },
          pathway: {
            id: 'some-pathway-id',
          },
          activity: {
            id: 'some-activity-id',
          },
          settings: {
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
          serviceRequestResource: JSON.stringify(ServiceRequestMock),
          status: ServiceRequestMock.status,
          intent: ServiceRequestMock.intent,
          priority: ServiceRequestMock.priority,
          patientId: '01953d3f-780c-719b-bbea-8e40ed73e67a',
        },
      })
    })
  })
})
