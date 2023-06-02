import { getBooking } from '../'
jest.mock('../../calComApi')

describe('Simple getBooking action', () => {
  const onComplete = jest.fn()
  const settings = {
    apiKey: 'apiKey',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await getBooking.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          bookingId: '123',
        },
        settings,
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        cancelUrl: `https://app.cal.com/booking/test?cancel=true`,
        rescheduleUrl: `https://app.cal.com/reschedule/test`,
        eventTypeId: '123',
      },
    })
  })
})
