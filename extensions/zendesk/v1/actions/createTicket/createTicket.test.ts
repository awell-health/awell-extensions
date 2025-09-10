import { createTicket } from './createTicket'
import { generateTestPayload } from '@/tests'

const mockTicketResponse = {
  ticket: {
    id: 12345,
  },
}

const mockZendeskAPIClient = {
  createTicket: jest.fn().mockResolvedValue(mockTicketResponse),
}

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockZendeskAPIClient),
}))

describe('Create ticket', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    onComplete.mockClear()
    onError.mockClear()
    mockZendeskAPIClient.createTicket.mockResolvedValue(mockTicketResponse)
  })

  test('Should create a ticket with required fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      auth_url: 'https://test-company.zendesk.com/oauth/tokens',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
      group_id: undefined,
      priority: undefined,
      external_id: undefined,
      tag: undefined,
    }

    const payload = generateTestPayload({
      fields: mockFields,
      settings: mockSettings,
    })

    await createTicket.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        ticketId: expect.any(String),
        ticketUrl: expect.stringContaining('test-company.zendesk.com'),
      }),
    })
  })

  test('Should create a ticket with all optional fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      auth_url: 'https://test-company.zendesk.com/oauth/tokens',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
      group_id: 123,
      priority: 'high',
      external_id: 'ext-123',
      tag: 'urgent',
    }

    const payload = generateTestPayload({
      fields: mockFields,
      settings: mockSettings,
    })

    await createTicket.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        ticketId: expect.any(String),
        ticketUrl: expect.stringContaining('test-company.zendesk.com'),
      }),
    })
  })
})
