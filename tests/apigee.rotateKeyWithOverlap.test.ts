import { generateTestPayload } from './constants'
import { rotateKeyWithOverlap } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - rotateKeyWithOverlap', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockRotateKeyWithOverlap = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      rotateKeyWithOverlap: mockRotateKeyWithOverlap,
    } as any))
  })

  test('Should rotate API key with overlap period', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockRotateKeyWithOverlap.mockResolvedValue({
      oldKeyId: 'old-key-123',
      newKeyId: 'new-key-456',
      overlapEndsAt: '2023-12-31T23:59:59Z'
    })

    const payload = generateTestPayload({
      fields: {
        developerId: 'test@example.com',
        appId: 'my-app',
        overlapHours: '48'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await rotateKeyWithOverlap.onActivityCreated!(payload, onComplete, onError)

    expect(mockRotateKeyWithOverlap).toHaveBeenCalledWith('test-org', 'test@example.com', 'my-app', 48)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        oldKeyId: 'old-key-123',
        newKeyId: 'new-key-456',
        overlapEndsAt: '2023-12-31T23:59:59Z',
        organizationId: 'test-org'
      }
    })
  })

  test('Should handle errors appropriately', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()

    mockRotateKeyWithOverlap.mockRejectedValue(new Error('API Error'))

    const payload = generateTestPayload({
      fields: {
        developerId: 'test@example.com',
        appId: 'my-app',
        overlapHours: '24'
      },
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await rotateKeyWithOverlap.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to rotate key with overlap: API Error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API Error',
          },
        },
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
