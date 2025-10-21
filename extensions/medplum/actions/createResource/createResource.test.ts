import { TestHelpers } from '@awell-health/extensions-core'
import { createResource } from './createResource'
import { MedplumClient } from '@medplum/core'

jest.mock('@medplum/core')

describe('Medplum - Create resource', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createResource)

  const mockCreateResource = jest.fn()
  const mockExecuteBatch = jest.fn()
  const mockSearch = jest.fn()

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
        search: mockSearch,
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
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
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
        wasResourceFound: 'false',
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
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
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
        resourcesCreated: JSON.stringify([
          {
            id: 'patient-1',
            resourceType: 'Patient',
            status: '201 Created',
            location: 'Patient/patient-1',
          },
          {
            id: 'observation-2',
            resourceType: 'Observation',
            status: '201 Created',
            location: 'Observation/observation-2',
          },
        ]),
        wasResourceFound: 'false',
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
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
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

  test('Should find and return existing resource when search parameters are provided', async () => {
    mockSearch.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'existing-patient-123',
            identifier: [{ value: 'MRN-12345' }],
            name: [{ family: 'Existing', given: ['Patient'] }],
          },
        },
        {
          resource: {
            resourceType: 'Patient',
            id: 'existing-patient-456',
            identifier: [{ value: 'MRN-12345' }],
            name: [{ family: 'Latest', given: ['Patient'] }],
          },
        },
      ],
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: JSON.stringify({
            resourceType: 'Patient',
            name: [{ family: 'New', given: ['Patient'] }],
          }),
          searchResourceType: 'Patient',
          searchIdentifier: 'MRN-12345',
        },
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockSearch).toHaveBeenCalledWith('Patient', {
      identifier: 'MRN-12345',
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: 'existing-patient-456',
        resourceType: 'Patient',
        wasResourceFound: 'true',
      },
    })
    expect(mockCreateResource).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should create resource when search parameters are provided but no resources found', async () => {
    mockSearch.mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    })

    mockCreateResource.mockResolvedValue({
      resourceType: 'Patient',
      id: 'new-patient-789',
      name: [{ family: 'New', given: ['Patient'] }],
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: JSON.stringify({
            resourceType: 'Patient',
            name: [{ family: 'New', given: ['Patient'] }],
          }),
          searchResourceType: 'Patient',
          searchIdentifier: 'MRN-99999',
        },
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockSearch).toHaveBeenCalledWith('Patient', {
      identifier: 'MRN-99999',
    })
    expect(mockCreateResource).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: 'new-patient-789',
        resourceType: 'Patient',
        wasResourceFound: 'false',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should create resource when only one search parameter is provided', async () => {
    mockCreateResource.mockResolvedValue({
      resourceType: 'Patient',
      id: 'patient-only-one-param',
      name: [{ family: 'Test', given: ['Patient'] }],
    })

    await extensionAction.onEvent({
      payload: {
        fields: {
          resourceJson: JSON.stringify({
            resourceType: 'Patient',
            name: [{ family: 'Test', given: ['Patient'] }],
          }),
          searchResourceType: 'Patient',
        },
        pathway: {
          id: 'some-pathway-id',
        },
        activity: {
          id: 'some-activity-id',
        },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockSearch).not.toHaveBeenCalled()
    expect(mockCreateResource).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: 'patient-only-one-param',
        resourceType: 'Patient',
        wasResourceFound: 'false',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
