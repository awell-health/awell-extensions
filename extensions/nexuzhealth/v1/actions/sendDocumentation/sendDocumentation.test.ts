import { sendDocumentation } from '.'
import { generateTestPayload } from '@/tests'

describe('Send documentation', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const basePayload = generateTestPayload({
    fields: {
      documentationId: 'test-documentation',
    },
    settings: {},
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call the onComplete callback', async () => {
    await sendDocumentation.onActivityCreated!(basePayload, onComplete, onError)

    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
