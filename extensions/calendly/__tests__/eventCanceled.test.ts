import { TestHelpers } from '@awell-health/extensions-core'
import { eventCanceled } from '../webhooks/eventCanceled'
import { testInviteeCanceled } from '../__mocks__/objects'
import {
  type CalendlyInviteeCanceledWebhook,
  type CalendlyWebhookPayload,
} from '../types'
import _ from 'lodash'
import { ZodError } from 'zod'

describe('Test event canceled', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(eventCanceled)

  const buildOnEventParams = <Payload>({ payload }: { payload: Payload }) => ({
    payload: {
      payload,
      rawBody: Buffer.from(JSON.stringify(payload)),
      headers: {},
      settings: {},
    },
    onSuccess,
    onError,
    helpers,
  })

  beforeEach(() => {
    clearMocks()
  })

  it('should return the correct data points', async () => {
    const event = testInviteeCanceled
    const evt = extensionWebhook.onEvent(
      buildOnEventParams<CalendlyInviteeCanceledWebhook>({
        payload: event,
      }),
    )
    await expect(evt).resolves.toBeUndefined()
    expect(onSuccess).toBeCalled()
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
  ])('onSuccess should always be called $name', async (params) => {
    const { payload, output } = params
    const merged = _.merge({}, testInviteeCanceled, { payload })
    const evt = extensionWebhook.onEvent(
      buildOnEventParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
    )
    await expect(evt).resolves.toBeUndefined()
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ data_points: expect.objectContaining(output) }),
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
    const evt = extensionWebhook.onEvent(
      buildOnEventParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
    )
    await expect(evt).rejects.toThrow(error)
  })
})
