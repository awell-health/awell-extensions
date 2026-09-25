import { TestHelpers } from '@awell-health/extensions-core'
import { eventCreated } from '../webhooks/eventCreated'
import { testInviteeCreated } from '../__mocks__/objects'
import {
  type CalendlyInviteeCreatedWebhook,
  type CalendlyWebhookPayload,
} from '../types'
import * as _ from 'lodash'
import { ZodError } from 'zod'

describe('Test event Created', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(eventCreated)

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
    const event = testInviteeCreated
    const evt = extensionWebhook.onEvent(
      buildOnEventParams<CalendlyInviteeCreatedWebhook>({
        payload: event,
      }),
    )
    await expect(evt).resolves.toBeUndefined()
    expect(onSuccess).toBeCalled()
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
  ])('onSuccess should always be called $name', async (params) => {
    const { payload, output } = params
    const merged = _.merge({}, testInviteeCreated, { payload })
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
        'Could not parse scheduled event type id from uri missing-scheduled-events',
      ),
    },
    {
      payload: { scheduled_event: { uri: 'missing-event-types' } },
      name: 'scheduled_event.uri is empty',
      error: Error(
        'Could not parse scheduled event id from uri missing-event-types',
      ),
    },
  ])('Error should throw: $name', async (params) => {
    const { payload, error } = params
    const merged = _.merge({}, testInviteeCreated, { payload })
    const evt = extensionWebhook.onEvent(
      buildOnEventParams<CalendlyWebhookPayload>({
        payload: merged,
      }),
    )
    await expect(evt).rejects.toThrow(error)
  })
})
