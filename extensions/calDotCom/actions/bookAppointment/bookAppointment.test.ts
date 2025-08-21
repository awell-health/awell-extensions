import { bookAppointment } from './bookAppointment'
import { generateTestPayload } from '@/tests'

describe('bookAppointment.onActivityCreated default prefill', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Anonymous patient: emits empty defaults', async () => {
    await bookAppointment.onActivityCreated!(
      generateTestPayload({
        fields: { calLink: 'awell/1h' },
        settings: { apiKey: 'abc123' },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    const arg = onComplete.mock.calls[0][0]
    expect(arg).toEqual({
      data_points: {
        defaultName: '',
        defaultEmail: '',
        defaultPhone: '',
      },
    })
  })

  test('Full profile: emits composed name and contact', async () => {
    await bookAppointment.onActivityCreated!(
      generateTestPayload({
        fields: { calLink: 'awell/1h' },
        settings: { apiKey: 'abc123' },
        patient: {
          profile: {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@example.com',
            phone_number: '+1 555 000 1234',
          },
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    const arg = onComplete.mock.calls[0][0]
    expect(arg).toEqual({
      data_points: {
        defaultName: 'Jane Doe',
        defaultEmail: 'jane.doe@example.com',
        defaultPhone: '+1 555 000 1234',
      },
    })
  })

  test('Partial profile: missing last_name', async () => {
    await bookAppointment.onActivityCreated!(
      generateTestPayload({
        fields: { calLink: 'awell/1h' },
        settings: { apiKey: 'abc123' },
        patient: {
          profile: {
            first_name: 'Jane',
            email: 'jane@example.com',
          },
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    const arg = onComplete.mock.calls[0][0]
    expect(arg).toEqual({
      data_points: {
        defaultName: 'Jane',
        defaultEmail: 'jane@example.com',
        defaultPhone: '',
      },
    })
  })

  test('Partial profile: missing first_name', async () => {
    await bookAppointment.onActivityCreated!(
      generateTestPayload({
        fields: { calLink: 'awell/1h' },
        settings: { apiKey: 'abc123' },
        patient: {
          profile: {
            last_name: 'Doe',
            phone_number: '123',
          },
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    const arg = onComplete.mock.calls[0][0]
    expect(arg).toEqual({
      data_points: {
        defaultName: 'Doe',
        defaultEmail: '',
        defaultPhone: '123',
      },
    })
  })
})
