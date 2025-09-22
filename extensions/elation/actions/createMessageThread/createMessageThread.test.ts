import { ZodError } from 'zod'
import { makeAPIClient } from '../../client'
import { createMessageThread as action } from './createMessageThread'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../tests/constants'
import { createAxiosError } from '../../../../tests'
import { FieldsValidationSchema } from './config'

jest.mock('../../client')

describe('createMessageThread action', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockCreateMessageThread = jest.fn()

  const validFields = {
    patientId: 123456,
    practiceId: 654321,
    senderId: 7891011,
    documentDate: undefined,
    chartDate: undefined,
    isUrgent: undefined,
    messageBody: 'Initial message in the thread',
    recipientId: undefined,
    groupId: undefined,
  }

  const validSettings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }

  const createTestPayload = (fields: any) =>
    generateTestPayload({ fields, settings: validSettings })

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      createMessageThread: mockCreateMessageThread,
    }))
  })

  beforeEach(() => {
    clearMocks()
  })

  describe('successful cases', () => {
    beforeEach(() => {
      mockCreateMessageThread.mockResolvedValue({ id: 1 })
    })

    it('should create a message thread with valid payload', async () => {
      await extensionAction.onEvent({
        payload: createTestPayload(validFields),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: { messageThreadId: '1' },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('validation errors', () => {
    it('should set default documentDate and chartDate if not provided', async () => {
      const validatedFields = FieldsValidationSchema.parse(validFields)

      expect(validatedFields.documentDate).not.toBeUndefined()
      expect(validatedFields.chartDate).not.toBeUndefined()
      expect(validatedFields.isUrgent).toBe(false)
    })

    it.each([
      ['invalid patientId', { patientId: 'invalid_id' }],
      ['missing messageBody', { messageBody: undefined }],
    ])('should fail with %s', async (_, invalidFields) => {
      const payload = createTestPayload(invalidFields)

      const response = extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      await expect(response).rejects.toThrow(ZodError)
    })
  })

  describe('error handling', () => {
    beforeEach(() => {
      mockCreateMessageThread.mockRejectedValue(
        createAxiosError(
          400,
          'Bad Request',
          JSON.stringify({
            detail: 'Bad Request',
          }),
        ),
      )
    })

    it('should handle API errors appropriately', async () => {
      const payload = createTestPayload(validFields)

      const response = extensionAction.onEvent({
        payload,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      await expect(response).rejects.toThrow()
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
