import { bookAppointment } from '..'
import { generateTestPayload } from '../../../../src/tests'

describe('Simple book appointment action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await bookAppointment.onActivityCreated(
      generateTestPayload({
        fields: {
          calLink: 'awell/1h',
        },
        settings: {
          apiKey: 'abc123',
        },
      }),
      onComplete,
      jest.fn()
    )
    expect(onComplete).not.toHaveBeenCalled()
  })
})
