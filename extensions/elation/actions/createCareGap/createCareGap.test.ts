import { createCareGap } from './createCareGap'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

const careGapExample = {
  id: 'CARE_GAP_ID',
}

// Add mock API client
const mockElationAPIClient = {
  createCareGap: jest.fn().mockResolvedValue(careGapExample),
}

// Mock the makeAPIClient function
jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockElationAPIClient),
}))

describe('Elation - Create care gap', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createCareGap)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
    mockElationAPIClient.createCareGap.mockResolvedValue(careGapExample)
  })

  const payload = {
    settings: {
      client_id: 'clientId',
      client_secret: 'clientSecret',
      username: 'username',
      password: 'password',
      auth_url: 'authUrl',
      base_url: 'baseUrl',
      rateLimitDuration: '10 s',
    },
    fields: {
      quality_program: 'quality_program',
      definition_id: 'definition_id',
      patient_id: 'patient_id',
      practice_id: 'practice_id',
      created_date: '2023-12-12T15:32:38.239Z',
      status: 'open',
      detail: 'detail',
    },
    activity: {
      id: '123',
    },
    pathway: {
      definition_id: '123',
      id: '123',
      tenant_id: '123',
      org_id: '123',
      org_slug: 'org-slug',
    },
    patient: {
      id: '123',
    },
  }

  test('should create care gap', async () => {
    await createCareGap.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { id: String(careGapExample.id) },
    })
  })
})
