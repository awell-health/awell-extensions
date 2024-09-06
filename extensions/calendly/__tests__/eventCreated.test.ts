import { eventCreated } from '../webhooks/eventCreated'
import { testInviteeCreated } from '../__mocks__/objects'
import { type OnWebhookReceivedParams } from '@awell-health/extensions-core'
import {
  type CalendlyInviteeCreatedWebhook,
  type CalendlyWebhookPayload,
} from '../types'
import * as _ from 'lodash'
import { ZodError } from 'zod'

describe('Test event Created', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const buildOnWebhookReceivedParams = <Payload>({
    payload,
  }: {
    payload: Payload
  }): OnWebhookReceivedParams<Payload> => {
    return {
      payload,
      rawBody: Buffer.from(JSON.stringify(payload)),
      headers: {},
      settings: {},
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the correct data points', async () => {
    const event = testInviteeCreated
    const evt = eventCreated.onWebhookReceived!(
      buildOnWebhookReceivedParams<CalendlyInviteeCreatedWebhook>({
        payload: event,
      }),
      onComplete,
      onError
    )
    await expect(evt).resolves.toBeUndefined()
    expect(onComplete).toBeCalled()
  })

  it.each([
    {
      name: 'rescheduled event `is_rescheduled_event: "true"`',
      payload: {
        old_invitee: 'some_old_invitee',
        scheduled_event: {
          name: 'rescheduled event',
        },
        first_name: 'ajsidofjsiodjfiosjdfiojsdifjsod',
      },
      output: {
        is_rescheduled_event: 'true',
      },
    },
    {
      name: 'new event should be called with `is_rescheduled_event: "false"`',
      payload: { scheduled_event: { name: 'new event' }, old_invitee: null },
      output: {
        is_rescheduled_event: 'false',
      },
    },
    {
      name: 'new event should be called with missing first/last name',
      payload: {
        scheduled_event: { name: 'new event' },
        first_name: null,
        last_name: null,
      },
      output: {
        is_rescheduled_event: 'false',
        inviteeFirstName: '',
        inviteeLastName: '',
      },
    },
  ])('onComplete should always be called $name', async (params) => {
    const { payload, output } = params
    const merged = _.merge({}, testInviteeCreated, { payload })
    const evt = eventCreated.onWebhookReceived!(
      buildOnWebhookReceivedParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
      onComplete,
      onError
    )
    await expect(evt).resolves.toBeUndefined()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ data_points: expect.objectContaining(output) })
    )
  })

  it.each([
    {
      payload: { scheduled_event: { name: 123 } },
      name: 'name is a number',
      output: {},
    },
    {
      payload: { scheduled_event: { status: 'unknown' } },
      name: 'status is unknown',
      error: ZodError,
    },
    {
      payload: { scheduled_event: { status: null } },
      name: 'status is null',
      error: ZodError,
    },
    {
      payload: { scheduled_event: { status: 'canceled' } },
      name: 'status is canceled',
      error: ZodError,
    },
    {
      payload: { scheduled_event: { event_type: 'missing-scheduled-events' } },
      name: 'scheduled_event.event_type is empty',
      error: Error(
        'Could not parse scheduled event type id from uri missing-scheduled-events'
      ),
    },
    {
      payload: { scheduled_event: { uri: 'missing-event-types' } },
      name: 'scheduled_event.uri is empty',
      error: Error(
        'Could not parse scheduled event id from uri missing-event-types'
      ),
    },
  ])('Error should throw: $name', async (params) => {
    const { payload, error } = params
    const merged = _.merge({}, testInviteeCreated, { payload })
    const evt = eventCreated.onWebhookReceived!(
      buildOnWebhookReceivedParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
      onComplete,
      onError
    )
    await expect(evt).rejects.toThrow(error)
  })
})
