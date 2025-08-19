import { generateTestPayload } from './constants'
import { ensureDeveloper } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - ensureDeveloper', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockEnsureDeveloper = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      ensureDeveloper: mockEnsureDeveloper,
    } as any))
  })

  test('Should return existing developer when developer exists', async () => {
    mockEnsureDeveloper.mockResolvedValue({
      developerId: 'existing-dev-id',
      email: 'test@example.com',
      status: 'active',
      created: false
    })

    const payload = generateTestPayload({
      fields: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await ensureDeveloper.onActivityCreated!(payload, onComplete, onError)

    expect(mockEnsureDeveloper).toHaveBeenCalledWith('test-org', 'test@example.com', 'John', 'Doe')
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        developerId: 'existing-dev-id',
        email: 'test@example.com',
        status: 'active',
        created: 'false',
        organizationId: 'test-org'
      }
    })
  })

  test('Should create new developer when developer does not exist', async () => {
    const mockClient = {
      get: jest.fn().mockRejectedValue({ response: { status: 404 } }),
      post: jest.fn().mockResolvedValue({
        data: {
          developerId: 'new-dev-id',
          email: 'test@example.com',
          status: 'active'
        }
      }),
      interceptors: {
        request: { use: jest.fn() }
      }
    }
    mockAxios.create.mockReturnValue(mockClient)

    const payload = generateTestPayload({
      fields: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await ensureDeveloper.onActivityCreated!(payload, onComplete, onError)

    expect(mockClient.get).toHaveBeenCalledWith('organizations/test-org/developers/test@example.com')
    expect(mockClient.post).toHaveBeenCalledWith('organizations/test-org/developers', {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      userName: 'test@example.com'
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        developerId: 'new-dev-id',
        email: 'test@example.com',
        status: 'active',
        created: 'true',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    const mockClient = {
      get: jest.fn().mockRejectedValue(new Error('Network error')),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() }
      }
    }
    mockAxios.create.mockReturnValue(mockClient)

    const payload = generateTestPayload({
      fields: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await ensureDeveloper.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to ensure developer: Network error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'Network error'
          }
        }
      ]
    })
  })
})
