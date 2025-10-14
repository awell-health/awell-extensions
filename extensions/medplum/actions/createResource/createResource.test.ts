import { TestHelpers } from '@awell-health/extensions-core'
import { createResource } from './createResource'
import { MedplumClient } from '@medplum/core'

jest.mock('@medplum/core')

describe('Medplum - Create resource', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createResource)

  const mockCreateResource = jest.fn()
  const mockExecuteBatch = jest.fn()

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    const mockedMedplumClient = jest.mocked(MedplumClient)
    mockedMedplumClient.mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        createResource: mockCreateResource,
        executeBatch: mockExecuteBatch,
      } as unknown as MedplumClient
    })
  })

  test('Should be defined', () => {
    expect(createResource).toBeDefined()
  })

  test('Should have the correct key', () => {
    expect(createResource.key).toBe('createResource')
  })

  test('Should create a single resource', async () => {
    mockCreateResource.mockResolvedValue({
      resourceType: 'Patient',
      id: 'patient-123',
      name: [{ family: 'Test', given: ['Patient'] }],
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: JSON.stringify({
            resourceType: 'Patient',
            name: [{ family: 'Test', given: ['Patient'] }],
          }),
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: 'patient-123',
        resourceType: 'Patient',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should create resources from a transaction Bundle', async () => {
    mockExecuteBatch.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'transaction-response',
      id: 'bundle-123',
      entry: [
        {
          response: {
            status: '201 Created',
            location: 'Patient/patient-1/_history/1',
          },
          resource: {
            resourceType: 'Patient',
            id: 'patient-1',
            name: [{ family: 'Smith' }],
          },
        },
        {
          response: {
            status: '201 Created',
            location: 'Observation/observation-2/_history/1',
          },
          resource: {
            resourceType: 'Observation',
            id: 'observation-2',
            status: 'final',
          },
        },
      ],
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: JSON.stringify({
            resourceType: 'Bundle',
            type: 'transaction',
            entry: [
              {
                resource: {
                  resourceType: 'Patient',
                  name: [{ family: 'Smith' }],
                },
                request: { method: 'POST', url: 'Patient' },
              },
              {
                resource: {
                  resourceType: 'Observation',
                  status: 'final',
                },
                request: { method: 'POST', url: 'Observation' },
              },
            ],
          }),
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundleId: 'bundle-123',
        bundleType: 'transaction-response',
        resourceIds: 'patient-1,observation-2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle invalid JSON', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: 'not valid json',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
