import { TestHelpers } from '@awell-health/extensions-core'
import { updateTicket as action } from './updateTicket'

const mockZendeskAPIClient = {
  updateTicket: jest.fn().mockResolvedValue(undefined),
}

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockZendeskAPIClient),
}))

describe('Update ticket', () => {
  const {
    extensionAction: updateTicket,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    mockZendeskAPIClient.updateTicket.mockResolvedValue(undefined)
  })

  test('Should update a ticket with comment only', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      ticket_id: '123',
      comment: 'This is an update comment',
      priority: undefined,
      status: undefined,
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

    await updateTicket.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('123', {
      comment: { body: 'This is an update comment' },
    })
    expect(onComplete).toHaveBeenCalledWith({})
  })

  test('Should update a ticket with all fields', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      ticket_id: '456',
      comment: 'Updating ticket with all fields',
      priority: 'high',
      status: 'open',
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

    await updateTicket.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('456', {
      comment: { body: 'Updating ticket with all fields' },
      priority: 'high',
      status: 'open',
    })
    expect(onComplete).toHaveBeenCalledWith({})
  })

  test('Should update a ticket with priority and status only', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      ticket_id: '789',
      comment: undefined,
      priority: 'urgent',
      status: 'solved',
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

    await updateTicket.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.updateTicket).toHaveBeenCalledWith('789', {
      priority: 'urgent',
      status: 'solved',
    })
    expect(onComplete).toHaveBeenCalledWith({})
  })

  test('Should handle API errors', async () => {
    const mockSettings = {
      subdomain: 'test-company',
      user_email: 'test@example.com',
      api_token: 'test-api-token',
    }

    const mockFields = {
      ticket_id: '999',
      comment: 'This will fail',
      priority: undefined,
      status: undefined,
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

    const apiError = new Error('API Error')
    mockZendeskAPIClient.updateTicket.mockRejectedValue(apiError)

    await updateTicket.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: { en: 'Failed to update ticket: API Error' },
          error: {
            category: 'SERVER_ERROR',
            message: 'API Error',
          },
        },
      ],
    })
  })
})
