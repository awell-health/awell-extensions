import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { updateTicket as action } from './updateTicket'
import { UpdateTicketResponseMock } from './__mocks__/UpdateTicketResponse.mock'

describe('Freshdesk - Update ticket', () => {
  let sendCallSpy: jest.SpyInstance

  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    sendCallSpy = jest
      .spyOn(FreshdeskApiClient.prototype, 'updateTicket')
      .mockImplementationOnce(
        jest.fn().mockResolvedValue(UpdateTicketResponseMock),
      )
  })

  test('Should work', async () => {
    await sendCall.onEvent({
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
