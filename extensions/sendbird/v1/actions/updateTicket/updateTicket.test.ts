import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockedChannelNames,
  mockedTicketData,
  SendbirdClientMockImplementation,
} from '../../client/__mocks__'
import { generateTestPayload } from '@/tests'
import { updateTicket } from './updateTicket'

jest.mock('../../client')

describe('Update ticket', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateTicket)

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
      ticketId: mockedTicketData.id,
      relatedChannelUrls: `${mockedChannelNames.channel1},${mockedChannelNames.channel2}`,
      priority: mockedTicketData.priority,
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
    await updateTicket.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(
      SendbirdClientMockImplementation.deskApi.updateTicket,
    ).toHaveBeenCalledWith(mockedTicketData.id, {
      relatedChannelUrls: `${mockedChannelNames.channel1},${mockedChannelNames.channel2}`,
      priority: mockedTicketData.priority,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call the onError callback when it receives invalid ticket ID', async () => {
    basePayload.fields.ticketId = NaN

    await updateTicket.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
