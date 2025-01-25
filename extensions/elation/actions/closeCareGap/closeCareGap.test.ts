import { closeCareGap } from './closeCareGap'

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
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    onComplete.mockClear()
    onError.mockClear()
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
      openAiApiKey: 'some_key',
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
    await closeCareGap.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalled()
  })
})
