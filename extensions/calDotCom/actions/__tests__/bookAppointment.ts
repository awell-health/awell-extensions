import { bookAppointment } from '..'

describe('Simple book appointment action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await bookAppointment.onActivityCreated(
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
          calLink: 'awell/1h',
        },
        settings: {
          apiKey: 'abc123',
        },
      },
      onComplete,
      jest.fn()
    )
    expect(onComplete).not.toHaveBeenCalled()
  })
})
