import { closeCareGap } from './closeCareGap'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

const careGapExample = {
  id: 'CARE_GAP_ID',
  status: 'closed',
}

// Add mock API client
const mockElationAPIClient = {
  closeCareGap: jest.fn().mockResolvedValue(careGapExample),
}

// Mock the makeAPIClient function
jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockElationAPIClient),
}))

describe('Elation - Close care gap', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(closeCareGap)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
    mockElationAPIClient.closeCareGap.mockResolvedValue(careGapExample)
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
      caregap_id: 'caregap_id',
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

  test('should close care gap', async () => {
    await closeCareGap.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
