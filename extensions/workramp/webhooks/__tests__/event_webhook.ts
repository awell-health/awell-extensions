import {
  OnWebhookReceivedParams,
  Settings,
} from '@awell-health/extensions-core'
import { WORKRAMP_IDENTIFIER } from '../../config'
import { EventPayload, EventType } from '../../types'
import { eventWebhook } from '../EventWebhook'

describe('Event webhook', () => {
  const exampleWebhook: EventPayload = {
    eventType: EventType.ContentCompletionPath,
    id: 'b74a95c5-a011-4fb2-aa55-e01074bbf2f8',
    timestamp: 1675816954321,
    user: {
      id: '86090baa-a643-11ed-9492-aa41bb3ba07e',
      email: 'exampleuser@example.com',
      firstName: 'Example',
      lastName: 'User',
      customAttributes: {
        department: 'Sales',
      },
    },
  }
  const onSuccess = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    jest.clearAllMocks()
  })
  it('should validate the example webhook', async () => {
    await eventWebhook.onWebhookReceived!(
      {
        payload: exampleWebhook,
        settings: {} as Settings,
      } as OnWebhookReceivedParams<EventPayload, {}>,
      onSuccess,
      onError
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith({
      data_points: {
        eventType: 'contentCompletion.path',
      },
      patient_identifier: {
        system: WORKRAMP_IDENTIFIER,
        value: exampleWebhook.user.id,
      },
    })
    expect(onError).toHaveBeenCalledTimes(0)
  })
})
