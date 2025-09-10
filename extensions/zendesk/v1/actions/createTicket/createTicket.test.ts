import { TestHelpers } from '@awell-health/extensions-core'
import { createTicket as action } from './createTicket'

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
  const {
    extensionAction: createTicket,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    jest.clearAllMocks()
    onComplete.mockClear()
    onError.mockClear()
    mockZendeskAPIClient.createTicket.mockResolvedValue(mockTicketResponse)
  })

  test('Should create a ticket with required fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
      group_id: undefined,
      priority: undefined,
      external_id: undefined,
      tag: undefined,
    }

    const payload = {
      fields: mockFields,
      settings: mockSettings,
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-definition-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
      },
      activity: {
        id: 'test-activity-id',
      },
      patient: {
        id: 'test-patient-id',
      },
    }

    await createTicket.onEvent!({ payload, onComplete, onError, helpers })

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
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      subject: 'Test ticket subject',
      comment: 'This is a test ticket comment',
      group_id: 123,
      priority: 'high',
      external_id: 'ext-123',
      tag: 'urgent',
    }

    const payload = {
      fields: mockFields,
      settings: mockSettings,
      pathway: {
        id: 'test-pathway-id',
        definition_id: 'test-definition-id',
        tenant_id: 'test-tenant-id',
        org_slug: 'test-org-slug',
        org_id: 'test-org-id',
      },
      activity: {
        id: 'test-activity-id',
      },
      patient: {
        id: 'test-patient-id',
      },
    }

    await createTicket.onEvent!({ payload, onComplete, onError, helpers })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        ticketId: expect.any(String),
        ticketUrl: expect.stringContaining('test-company.zendesk.com'),
      }),
    })
  })
})
