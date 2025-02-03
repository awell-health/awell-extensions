import { generateTestPayload } from '../../../../tests/constants'
import { ZodError } from 'zod'
import { makeAPIClient } from '../../client'
import { createMessageThread } from './createMessageThread'
import { allergyExample } from '../../__mocks__/constants'

jest.mock('../../client')

describe('createMessageThread action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const mockAPIClient = makeAPIClient as jest.Mock

  // Test constants
  const VALID_PAYLOAD = {
    patientId: 123456,
    practiceId: 654321,
    senderId: 7891011,
    documentDate: '2024-11-05',
    chartDate: '2024-11-05',
    isUrgent: true,
    messageBody: 'Initial message in the thread',
  }

  const settings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }

  const withFields = (fields: any) => generateTestPayload({ fields, settings })

  // Helper function to create test cases
  const createTestPayload = (overrides = {}) => 
    withFields({ ...VALID_PAYLOAD, ...overrides })

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
    // Reset API mock to successful case by default
    mockAPIClient.mockImplementation(() => ({
      createMessageThread: jest.fn(async () => ({ id: 1 })),
    }))
  })

  describe('successful cases', () => {
    it('should create a message thread with valid payload', async () => {
      const payload = createTestPayload()

      await createMessageThread.onEvent!({
        payload,
        onComplete,
        onError,
        helpers: {} as any,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: { messageThreadId: '1' },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('validation errors', () => {
    it.each([
      ['invalid patientId', { patientId: 'invalid_id' }],
      ['missing messageBody', { messageBody: undefined }],
    ])('should fail with %s', async (_, invalidFields) => {
      const payload = createTestPayload(invalidFields)

      const response = createMessageThread.onEvent!({
        payload,
        onComplete,
        onError,
        helpers: {} as any,
      })

      await expect(response).rejects.toThrow(ZodError)
    })
  })

  describe('error handling', () => {
    it('should handle API errors appropriately', async () => {
      mockAPIClient.mockImplementationOnce(() => ({
        createMessageThread: jest.fn(async () => {
          throw new Error('API error')
        }),
      }))

      const payload = createTestPayload()

      const response = createMessageThread.onEvent!({
        payload,
        onComplete,
        onError,
        helpers: {} as any,
      })

      await expect(response).rejects.toThrowError('API error')
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
