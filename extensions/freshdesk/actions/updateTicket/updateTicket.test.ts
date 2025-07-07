import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { updateTicket as action } from './updateTicket'
import { UpdateTicketResponseMock } from './__mocks__/UpdateTicketResponse.mock'
import { GetTicketResponseMock } from '../getTicket/__mocks__/GetTicketResponse.mock'

describe('Freshdesk - Update ticket', () => {
  let getTicketSpy: jest.SpyInstance
  let updateTicketSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    getTicketSpy = jest
      .spyOn(FreshdeskApiClient.prototype, 'getTicket')
      .mockImplementationOnce(
        jest.fn().mockResolvedValue({ data: GetTicketResponseMock }),
      )
    updateTicketSpy = jest
      .spyOn(FreshdeskApiClient.prototype, 'updateTicket')
      .mockImplementationOnce(
        jest.fn().mockResolvedValue({ data: UpdateTicketResponseMock }),
      )
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          ticketId: '1',
          subject: 'New subject',
          description: 'New description',
        },
        settings: {
          domain: 'domain',
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
