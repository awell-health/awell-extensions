import { eventCanceled } from '../webhooks/eventCanceled'
import { testInviteeCanceled } from '../__mocks__/objects'
import { type OnWebhookReceivedParams } from '@awell-health/extensions-core'
import {
  type CalendlyInviteeCanceledWebhook,
  type CalendlyWebhookPayload,
} from '../types'
import _ from 'lodash'
import { ZodError } from 'zod'

describe('Test event canceled', () => {
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
    const event = testInviteeCanceled
    const evt = eventCanceled.onWebhookReceived!(
      buildOnWebhookReceivedParams<CalendlyInviteeCanceledWebhook>({
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
      name: 'rescheduled event',
      payload: {
        old_invitee: 'some_old_invitee',
        rescheduled: true,
      },
      output: {
        rescheduled: 'true',
      },
    },
    {
      name: 'new event should be called with `is_rescheduled_event: "false"`',
      payload: {
        scheduled_event: { name: 'new event' },
        cancellation: { reason: 'ouch' },
      },
      output: {
        cancellation_reason: 'ouch',
      },
    },
  ])('onComplete should always be called $name', async (params) => {
    const { payload, output } = params
    const merged = _.merge({}, testInviteeCanceled, { payload })
    const evt = eventCanceled.onWebhookReceived!(
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
      payload: { scheduled_event: { status: 'active' } },
      name: 'status is active',
      error: ZodError,
    },
    {
      payload: { scheduled_event: { status: null } },
      name: 'status is null',
      error: ZodError,
    },
  ])('Error should throw: $name', async (params) => {
    const { payload, error } = params
    const merged = _.merge({}, testInviteeCanceled, { payload })
    const evt = eventCanceled.onWebhookReceived!(
      buildOnWebhookReceivedParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
      onComplete,
      onError
    )
    await expect(evt).rejects.toThrow(error)
  })
})
