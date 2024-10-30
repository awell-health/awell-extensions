import { sendMessage } from '.'
import { generateTestPayload } from '@/tests'

describe('Send message', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      subject: 'test-subject',
      body: 'test-body',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendMessage.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
