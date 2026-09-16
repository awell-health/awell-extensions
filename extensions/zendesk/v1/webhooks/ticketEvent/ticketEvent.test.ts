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
}

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

  describe('When settings are missing', () => {
    test('Should respond 400', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: triggerWebhookPayload,
          settings: { subdomain: '', user_email: '', api_token: '' },
          rawBody: Buffer.from(''),
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

  describe('When the ticket cannot be found', () => {
    test('Should respond 404', async () => {
      const notFound = new AxiosError(
        'Not found',
        '404',
        undefined,
        undefined,
        {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'RecordNotFound', description: 'Not found' },
          headers: {},
          config: {} as any,
        } as AxiosResponse,
      )
      mockZendeskAPIClient.getTicket.mockRejectedValue(notFound)

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

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 404,
          message: 'Ticket 35436 was not found in Zendesk',
        },
      })
    })
  })
})
