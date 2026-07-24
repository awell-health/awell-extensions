import { createBooking } from './createBooking'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockReturnValue,
  sampleBooking,
} from '../../lib/api/v1/__mocks__/calComApi'

jest.mock('../../lib/api/v1/calComApi', () => jest.fn(() => mockReturnValue))

describe('Create booking', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createBooking)

  const basePayload = generateTestPayload({
    fields: {
      eventTypeId: sampleBooking.eventTypeId,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
      responses: JSON.stringify(sampleBooking.responses),
      metadata: JSON.stringify({}),
      timeZone: sampleBooking.timeZone,
      language: sampleBooking.language,
      title: sampleBooking.title,
      recurringEventId: undefined,
      description: undefined,
      status: sampleBooking.status,
    },
    settings: {
      apiKey: 'abc123',
      customDomain: undefined,
    },
  })

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await createBooking.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockReturnValue.createBooking).toHaveBeenCalledWith({
      eventTypeId: sampleBooking.eventTypeId,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
      responses: sampleBooking.responses,
      metadata: {},
      timeZone: sampleBooking.timeZone,
      language: sampleBooking.language,
      title: sampleBooking.title,
      recurringEventId: undefined,
      description: undefined,
      status: sampleBooking.status,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bookingId: String(sampleBooking.id),
      },
    })
    expect(helpers.log).toHaveBeenCalledWith(
      {
        meta: {
          tenant_id: basePayload.pathway.tenant_id,
          careflow_id: basePayload.pathway.id,
          activity_id: basePayload.activity.id,
        },
        createBookingRequest: {
          eventTypeId: sampleBooking.eventTypeId,
          start: sampleBooking.startTime,
          end: sampleBooking.endTime,
          responses: sampleBooking.responses,
          metadata: {},
          timeZone: sampleBooking.timeZone,
          language: sampleBooking.language,
          title: sampleBooking.title,
          recurringEventId: undefined,
          description: undefined,
          status: sampleBooking.status,
        },
      },
      'Creating Cal.com booking',
    )
  })
})
