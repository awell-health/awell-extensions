import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedChannelNames,
  mockedTicketData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { createTicket } from '..'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Create ticket', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createTicket)

  const basePayload = generateTestPayload({
    pathway: {
      id: 'pathway-id',
      definition_id: 'pathway-definition-id',
    },
    activity: {
      id: 'activity-id',
    },
    patient: { id: 'test-patient' },
    fields: {
      customerId: mockedTicketData.customer.id,
      channelName: mockedTicketData.channelName,
      relatedChannelUrls: `${mockedChannelNames.channel1},${mockedChannelNames.channel2}`,
      groupKey: mockedTicketData.group.key,
      priority: mockedTicketData.priority,
      customFields: JSON.stringify({
        [mockedTicketData.customFields[0].key]:
          mockedTicketData.customFields[0].value,
      }),
    },
    settings: {
      applicationId: 'applicationId',
      chatApiToken: 'chatApiToken',
      deskApiToken: 'deskApiToken',
    },
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createTicket.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.deskApi.createTicket,
    ).toHaveBeenCalledWith({
      customerId: mockedTicketData.customer.id,
      channelName: mockedTicketData.channelName,
      relatedChannelUrls: `${mockedChannelNames.channel1},${mockedChannelNames.channel2}`,
      groupKey: mockedTicketData.group.key,
      priority: mockedTicketData.priority,
      customFields: JSON.stringify({
        [mockedTicketData.customFields[0].key]:
          mockedTicketData.customFields[0].value,
      }),
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        ticketId: String(mockedTicketData.id),
        channelUrl: mockedTicketData.channelUrl,
        relatedChannelUrls: `${mockedChannelNames.channel1},${mockedChannelNames.channel2}`,
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
