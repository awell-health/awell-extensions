import { deleteBooking } from './deleteBooking'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockReturnValue,
  sampleBooking,
} from '../../lib/api/v1/__mocks__/calComApi'

jest.mock('../../lib/api/v1/calComApi', () => jest.fn(() => mockReturnValue))

describe('Delete booking', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteBooking)

  const basePayload = generateTestPayload({
    fields: {
      bookingId: String(sampleBooking.id),
      allRemainingBookings: undefined,
      reason: undefined,
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
    await deleteBooking.onEvent!({
      payload: basePayload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockReturnValue.deleteBooking).toHaveBeenCalledWith(
      String(sampleBooking.id),
      { allRemainingBookings: undefined, cancellationReason: undefined },
    )
    expect(onComplete).toHaveBeenCalledWith()
    expect(helpers.log).toHaveBeenCalledWith(
      {
        meta: {
          tenant_id: basePayload.pathway.tenant_id,
          careflow_id: basePayload.pathway.id,
          activity_id: basePayload.activity.id,
        },
        bookingId: String(sampleBooking.id),
        deleteBookingRequest: {
          allRemainingBookings: undefined,
          cancellationReason: undefined,
        },
      },
      'Deleting Cal.com booking',
    )
  })
})
