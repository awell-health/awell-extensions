import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { getTicket as action } from './getTicket'
import { GetTicketResponseMock } from './__mocks__/GetTicketResponse.mock'

describe('Freshdesk - Get ticket', () => {
  let getTicketSpy: jest.SpyInstance

  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    getTicketSpy = jest
      .spyOn(FreshdeskApiClient.prototype, 'getTicket')
      .mockImplementationOnce(
        jest.fn().mockResolvedValue(GetTicketResponseMock),
      )
  })

  test('Should work', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          ticketId: '1',
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        ticketData: JSON.stringify(GetTicketResponseMock.data),
        subject: GetTicketResponseMock.data.subject,
        type: GetTicketResponseMock.data.type,
        priorityValue: String(GetTicketResponseMock.data.priority),
        priorityLabel: 'Low',
        statusValue: String(GetTicketResponseMock.data.status),
        statusLabel: 'Open',
        sourceValue: String(GetTicketResponseMock.data.source),
        sourceLabel: 'Portal',
        descriptionText: GetTicketResponseMock.data.description_text,
        descriptionHtml: GetTicketResponseMock.data.description,
        customFields: JSON.stringify(GetTicketResponseMock.data.custom_fields),
        tags: JSON.stringify(GetTicketResponseMock.data.tags),
      },
    })
  })
})
