import { generateTestPayload } from '@/tests'
import { ZodError } from 'zod'
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
  const VALID_SENDER_ID = 7891011
  const VALID_DATE = '2024-11-05' // Example date for required fields

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  it('should create a message thread successfully', async () => {
    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      senderId: VALID_SENDER_ID,
      documentDate: VALID_DATE,
      chartDate: VALID_DATE,
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
      senderId: VALID_SENDER_ID,
      documentDate: VALID_DATE,
      chartDate: VALID_DATE,
      isUrgent: true,
      messageBody: 'Initial message in the thread',
    })

    const response = createMessageThread.onActivityCreated!(
      payload,
      onComplete,
      onError,
    )
    await expect(response).rejects.toThrow(ZodError)
  })

  it('should fail with missing required messageBody', async () => {
    const payload = withFields({
      patientId: VALID_PATIENT_ID,
      practiceId: VALID_PRACTICE_ID,
      senderId: VALID_SENDER_ID,
      documentDate: VALID_DATE,
      chartDate: VALID_DATE,
      isUrgent: true,
      messageBody: undefined as unknown as string,
    })

    const response = createMessageThread.onActivityCreated!(
      payload,
      onComplete,
      onError,
    )
    await expect(response).rejects.toThrow(ZodError)
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
      senderId: VALID_SENDER_ID,
      documentDate: VALID_DATE,
      chartDate: VALID_DATE,
      isUrgent: true,
      messageBody: 'Initial message in the thread',
    })

    const response = createMessageThread.onActivityCreated!(
      payload,
      onComplete,
      onError,
    )
    await expect(response).rejects.toThrowError(new Error('API error'))
    expect(onComplete).not.toHaveBeenCalled()
  })
})
