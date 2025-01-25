import { createCareGap } from './createCareGap'

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
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    onComplete.mockClear()
    onError.mockClear()
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
      openAiApiKey: 'some_key',
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
    await createCareGap.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: { id: String(careGapExample.id) },
    })
  })
})
