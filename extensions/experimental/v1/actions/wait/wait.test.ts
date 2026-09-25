import { wait } from '.'
import { MAX_TIMER_DELAY_MS } from './wait'
import { generateTestPayload } from '@/tests'

describe('Experimental - Wait', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const runWait = async (seconds: number): Promise<void> => {
    await wait.onActivityCreated!(
      generateTestPayload({ fields: { seconds }, settings: {} }),
      onComplete,
      onError,
    )
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    onComplete.mockResolvedValue(undefined)
    onError.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('returns without waiting for the timer', async () => {
    // Fake timers never advance on their own, so this only resolves because
    // the handler does not await the 72-hour timer.
    await runWait(259_200)

    expect(onComplete).not.toHaveBeenCalled()
    expect(jest.getTimerCount()).toBe(1)
  })

  test('completes the activity once the wait has elapsed', async () => {
    await runWait(10)

    await jest.advanceTimersByTimeAsync(9_999)
    expect(onComplete).not.toHaveBeenCalled()

    await jest.advanceTimersByTimeAsync(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('reports a failed completion through onError', async () => {
    onComplete.mockRejectedValueOnce(new Error('Redis connection lost'))

    await runWait(1)
    await jest.advanceTimersByTimeAsync(1_000)

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: { en: 'Failed to complete the wait: Redis connection lost' },
          error: { category: 'SERVER_ERROR', message: 'Redis connection lost' },
        }),
      ],
    })
  })

  test('logs instead of rejecting when onError fails too', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    onComplete.mockRejectedValueOnce(new Error('Redis connection lost'))
    onError.mockRejectedValueOnce(new Error('Redis still down'))

    await runWait(1)
    await jest.advanceTimersByTimeAsync(1_000)

    expect(consoleError).toHaveBeenCalledWith(
      'experimental.wait: could not report a failed wait',
      expect.objectContaining({ message: 'Redis still down' }),
    )
    consoleError.mockRestore()
  })

  test.each([0, -30])(
    'completes straight away when there is nothing left to wait (%i s)',
    async (seconds) => {
      await runWait(seconds)

      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(jest.getTimerCount()).toBe(0)
    },
  )

  test('caps waits longer than one Node timer can hold', async () => {
    // Uncapped, Node would fire this 30-day timer after 1 ms.
    await runWait(30 * 24 * 60 * 60)

    await jest.advanceTimersByTimeAsync(MAX_TIMER_DELAY_MS - 1)
    expect(onComplete).not.toHaveBeenCalled()

    await jest.advanceTimersByTimeAsync(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
