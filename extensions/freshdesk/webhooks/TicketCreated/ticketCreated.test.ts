import { TestHelpers } from '@awell-health/extensions-core'
import { ticketCreated as webhook } from '.'
import { ticketCreatedPayload } from './__testdata__/ticketCreated.mock'
import { FreshdeskApiClient } from '../../lib/api/client'
import { GetTicketResponseMock } from '../../actions/getTicket/__mocks__/GetTicketResponse.mock'
import { FRESHDESK_IDENTIFIER_SYSTEM } from '../../settings'

describe('Freshesk - Webhook - Ticket created', () => {
  let getTicketSpy: jest.SpyInstance

  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When payload is valid', () => {
    beforeEach(() => {
      getTicketSpy = jest
        .spyOn(FreshdeskApiClient.prototype, 'getTicket')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(GetTicketResponseMock),
        )
    })

    test('Should call onSuccess, which starts the care flow', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: ticketCreatedPayload,
          settings: {
            domain: 'domain',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          ticketId: '20',
        },
        patient_identifier: {
          system: FRESHDESK_IDENTIFIER_SYSTEM,
          value: '1',
        },
      })
    })
  })
})
