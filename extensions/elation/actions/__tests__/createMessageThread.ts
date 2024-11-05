import { generateTestPayload } from '@/tests'
import { makeAPIClient } from '../../client'
import { createMessageThread } from '../createMessageThread'

jest.mock('../../client')

describe('createMessageThread action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const mockAPIClient = makeAPIClient as jest.Mock

  mockAPIClient.mockImplementation(() => ({
    createMessageThread: jest.fn(async () => ({ id: 1 })),
  }))

  const settings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }

  const withFields = (fields: any) => generateTestPayload({ fields, settings })

  const VALID_PATIENT_ID = 123456
  const VALID_PRACTICE_ID = 654321

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  it('should create a message thread successfully', async () => {
    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      isUrgent: true,
      messageBody: 'Initial message in the thread',
    })

    await createMessageThread.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        messageThreadId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('should fail with invalid patientId (non-numeric)', async () => {
    const payload = withFields({
      patientId: 'invalid_id' as unknown as number,
      practiceId: VALID_PRACTICE_ID,
      isUrgent: true,
      messageBody: 'Initial message in the thread',
    })

    await createMessageThread.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0].events[0].error).toEqual(
      expect.objectContaining({
        category: 'SERVER_ERROR',
        message: expect.stringContaining('Validation error'),
      })
    )
  })

  it('should fail with missing required messageBody', async () => {
    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      isUrgent: true,
      messageBody: undefined as unknown as string,
    })

    await createMessageThread.onActivityCreated!(payload, onComplete, onError)

    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0].events[0].error).toEqual(
      expect.objectContaining({
        category: 'SERVER_ERROR',
        message: expect.stringContaining('Validation error'),
      })
    )
  })

  it('should create a non-urgent message thread if isUrgent is missing', async () => {
    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      messageBody: 'Initial message in the thread',
    })

    await createMessageThread.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        messageThreadId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('should handle API error gracefully', async () => {
    mockAPIClient.mockImplementationOnce(() => ({
      createMessageThread: jest.fn(async () => {
        throw new Error('API error')
      }),
    }))

    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      isUrgent: true,
      messageBody: 'Initial message in the thread',
    })

    await createMessageThread.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: expect.arrayContaining([
        expect.objectContaining({
          text: { en: 'API error' },
          error: expect.objectContaining({
            category: 'SERVER_ERROR',
            message: 'API error',
          }),
        }),
      ]),
    })
  })
})
