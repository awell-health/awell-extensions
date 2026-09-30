import { TestHelpers } from '@awell-health/extensions-core'
import { AxiosError, type AxiosResponse } from 'axios'
import { getTicket as action } from './getTicket'
import {
  expectedTicketDataPoints,
  getTicketResponseMock,
} from '../../__testdata__/getTicketResponse.mock'

const mockZendeskAPIClient = {
  getTicket: jest.fn(),
}

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => mockZendeskAPIClient),
}))

const mockSettings = {
  subdomain: 'test-company',
  user_email: 'test@example.com',
  api_token: 'test-api-token',
  oauth_client_id: undefined,
  oauth_client_secret: undefined,
}

const basePayload = {
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

describe('Zendesk - Get ticket', () => {
  const {
    extensionAction: getTicket,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    mockZendeskAPIClient.getTicket.mockReset()
  })

  test('Should return the ticket as data points', async () => {
    mockZendeskAPIClient.getTicket.mockResolvedValue(getTicketResponseMock)

    await getTicket.onEvent!({
      payload: { ...basePayload, fields: { ticket_id: 35436 } },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockZendeskAPIClient.getTicket).toHaveBeenCalledWith('35436')
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: expectedTicketDataPoints,
    })
  })

  test('Should return empty strings when the requester is not side-loaded', async () => {
    mockZendeskAPIClient.getTicket.mockResolvedValue({
      ticket: { ...getTicketResponseMock.ticket, external_id: null },
    })

    await getTicket.onEvent!({
      payload: { ...basePayload, fields: { ticket_id: 35436 } },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        externalId: '',
        requesterId: '20978392',
        requesterName: '',
        requesterEmail: '',
      }),
    })
  })

  test('Should call onError when the ticket does not exist', async () => {
    const notFound = new AxiosError('Not found', '404', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      data: { error: 'RecordNotFound', description: 'Not found' },
      headers: {},
      config: {} as any,
    } as AxiosResponse)
    mockZendeskAPIClient.getTicket.mockRejectedValue(notFound)

    await getTicket.onEvent!({
      payload: { ...basePayload, fields: { ticket_id: 1 } },
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: { en: 'Ticket not found (404)' },
          error: expect.objectContaining({ category: 'BAD_REQUEST' }),
        }),
      ],
    })
  })
})
