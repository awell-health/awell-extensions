import { TestHelpers } from '@awell-health/extensions-core'
import { AxiosError, type AxiosResponse } from 'axios'
import { ticketEvent as webhook } from '.'
import {
  triggerWebhookPayload,
  zendeskTicketEventPayload,
} from './__testdata__/ticketEvent.mock'
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

const settings = {
  subdomain: 'test-company',
  user_email: 'test@example.com',
  api_token: 'test-api-token',
  oauth_client_id: undefined,
  oauth_client_secret: undefined,
}

const axios404 = new AxiosError('Not found', '404', undefined, undefined, {
  status: 404,
  statusText: 'Not Found',
  data: { error: 'RecordNotFound', description: 'Not found' },
  headers: {},
  config: {} as any,
} as AxiosResponse)

describe('Zendesk - Webhook - Ticket event', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
    mockZendeskAPIClient.getTicket.mockReset()
    mockZendeskAPIClient.getTicket.mockResolvedValue(getTicketResponseMock)
  })

  describe('When the webhook is connected to a trigger', () => {
    test('Should fetch the ticket and call onSuccess', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: triggerWebhookPayload,
          settings,
          rawBody: Buffer.from(JSON.stringify(triggerWebhookPayload)),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(mockZendeskAPIClient.getTicket).toHaveBeenCalledWith('35436')
      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          ...expectedTicketDataPoints,
          eventType: 'kit_retrieval_requested',
          ticketFetched: 'true',
          payload: JSON.stringify(triggerWebhookPayload),
        },
      })
    })

    test('Should accept a numeric ticket_id and default the event type', async () => {
      const payload = { ticket_id: 35436 }

      await extensionWebhook.onEvent!({
        payload: {
          payload,
          settings,
          rawBody: Buffer.from(JSON.stringify(payload)),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(mockZendeskAPIClient.getTicket).toHaveBeenCalledWith('35436')
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: expect.objectContaining({
          ticketId: '35436',
          eventType: 'trigger',
          ticketFetched: 'true',
        }),
      })
    })
  })

  describe('When the webhook is subscribed to Zendesk ticket events', () => {
    test('Should read the ticket id from detail and use the event type', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: zendeskTicketEventPayload,
          settings,
          rawBody: Buffer.from(JSON.stringify(zendeskTicketEventPayload)),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(mockZendeskAPIClient.getTicket).toHaveBeenCalledWith('35436')
      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          ...expectedTicketDataPoints,
          eventType: 'zen:event-type:ticket.created',
          ticketFetched: 'true',
          payload: JSON.stringify(zendeskTicketEventPayload),
        },
      })
    })
  })

  describe('When the payload is invalid', () => {
    test('Should respond 400 and not call onSuccess', async () => {
      const payload = { something: 'else' }

      await extensionWebhook.onEvent!({
        payload: {
          payload: payload as any,
          settings,
          rawBody: Buffer.from(JSON.stringify(payload)),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(mockZendeskAPIClient.getTicket).not.toHaveBeenCalled()
      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: expect.objectContaining({ statusCode: 400 }),
      })
    })

    test('Should respond 400 for a non-ticket Zendesk event', async () => {
      const payload = {
        ...zendeskTicketEventPayload,
        type: 'zen:event-type:user.created',
      }

      await extensionWebhook.onEvent!({
        payload: {
          payload: payload as any,
          settings,
          rawBody: Buffer.from(JSON.stringify(payload)),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: expect.objectContaining({ statusCode: 400 }),
      })
    })
  })

  describe('When the ticket cannot be fetched', () => {
    test('Should fall back to the trigger body when credentials are missing', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: triggerWebhookPayload,
          settings: {
            subdomain: 'test-company',
            user_email: undefined,
            api_token: undefined,
            oauth_client_id: undefined,
            oauth_client_secret: undefined,
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(mockZendeskAPIClient.getTicket).not.toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: expect.objectContaining({
          ticketId: '35436',
          ticketUrl: 'https://test-company.zendesk.com/agent/tickets/35436',
          eventType: 'kit_retrieval_requested',
          ticketFetched: 'false',
          subject: 'Kit retrieval request',
          status: 'open',
          requesterEmail: 'jane@example.com',
          requesterName: 'Jane Requester',
          tags: JSON.stringify(['kit_retrieval', 'enterprise']),
          externalId: 'awell-patient-123',
          requesterId: '',
          customFields: '[]',
          payload: JSON.stringify(triggerWebhookPayload),
        }),
        events: [
          expect.objectContaining({
            text: {
              en: expect.stringContaining('extension settings are incomplete'),
            },
          }),
        ],
      })
    })

    test('Should fall back to the trigger body when the ticket is not found', async () => {
      mockZendeskAPIClient.getTicket.mockRejectedValue(axios404)

      await extensionWebhook.onEvent!({
        payload: {
          payload: triggerWebhookPayload,
          settings,
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: expect.objectContaining({
          ticketId: '35436',
          ticketFetched: 'false',
          subject: 'Kit retrieval request',
          requesterEmail: 'jane@example.com',
        }),
        events: [
          expect.objectContaining({
            text: { en: expect.stringContaining('not found') },
          }),
        ],
      })
    })

    test('Should build the ticket URL from the body when no subdomain is configured', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: triggerWebhookPayload,
          settings: {
            subdomain: undefined,
            user_email: undefined,
            api_token: undefined,
            oauth_client_id: undefined,
            oauth_client_secret: undefined,
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          data_points: expect.objectContaining({
            ticketUrl: 'https://test-company.zendesk.com/agent/tickets/35436',
            ticketFetched: 'false',
          }),
        }),
      )
    })

    test('Should fall back to the event detail for Zendesk ticket events', async () => {
      mockZendeskAPIClient.getTicket.mockRejectedValue(new Error('boom'))

      await extensionWebhook.onEvent!({
        payload: {
          payload: zendeskTicketEventPayload,
          settings,
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: expect.objectContaining({
          ticketId: '35436',
          eventType: 'zen:event-type:ticket.created',
          ticketFetched: 'false',
          subject: 'Kit retrieval request',
          status: 'open',
          requesterId: '20978392',
          externalId: 'awell-patient-123',
          tags: JSON.stringify(['kit_retrieval']),
        }),
        events: [
          expect.objectContaining({ text: { en: expect.stringContaining('boom') } }),
        ],
      })
      // Key order changes after zod parsing, so compare the parsed object.
      const dataPoints = onSuccess.mock.calls[0][0].data_points
      expect(JSON.parse(dataPoints.ticket)).toEqual(
        zendeskTicketEventPayload.detail,
      )
    })
  })
})
