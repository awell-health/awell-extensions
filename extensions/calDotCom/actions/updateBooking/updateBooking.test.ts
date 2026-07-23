import { updateBooking } from './updateBooking'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockReturnValue,
  sampleBooking,
} from '../../lib/api/v1/__mocks__/calComApi'

jest.mock('../../lib/api/v1/calComApi', () => jest.fn(() => mockReturnValue))

describe('Update booking', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateBooking)

  const basePayload = generateTestPayload({
    fields: {
      bookingId: String(sampleBooking.id),
      title: sampleBooking.title,
      description: undefined,
      status: sampleBooking.status,
      start: sampleBooking.startTime,
      end: sampleBooking.endTime,
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
    await updateBooking.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockReturnValue.updateBooking).toHaveBeenCalledWith(
      String(sampleBooking.id),
      {
        title: sampleBooking.title,
        description: undefined,
        status: sampleBooking.status,
        start: sampleBooking.startTime,
        end: sampleBooking.endTime,
      },
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bookingId: String(sampleBooking.id),
        bookingUid: sampleBooking.uid,
      },
    })
    expect(helpers.log).toHaveBeenCalledWith(
      {
        meta: {
          tenant_id: basePayload.pathway.tenant_id,
          careflow_id: basePayload.pathway.id,
          activity_id: basePayload.activity.id,
        },
        bookingId: String(sampleBooking.id),
        updateBookingRequest: {
          title: sampleBooking.title,
          description: undefined,
          status: sampleBooking.status,
          start: sampleBooking.startTime,
          end: sampleBooking.endTime,
        },
      },
      'Updating Cal.com booking',
    )
  })
})
