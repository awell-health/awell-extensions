import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { HEALTHIE_IDENTIFIER } from '../../lib/types'
import { formatError } from '../../lib/sdk/graphql-codegen/errors'
import { TestHelpers } from '@awell-health/extensions-core'
import { formAnswerGroupLocked } from '../formAnswerGroupLocked'
import { processFormAnswersForSize } from '../../lib/helpers/processFormAnswers'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')
jest.mock('../../lib/helpers/processFormAnswers')

const mockedProcessFormAnswersForSize = jest.mocked(processFormAnswersForSize)

describe('formAnswerGroupLocked', () => {
  const { onSuccess, onError, helpers, clearMocks, extensionWebhook } =
    TestHelpers.fromWebhook(formAnswerGroupLocked)

  const basePayload = {
    resource_id: 3456,
    resource_id_type: 'FormAnswerGroup',
    event_type: 'form_answer_group.locked',
  }

  const mockFormAnswerGroup = {
    id: '3456',
    user: { id: 'user_456' },
    form_answers: [
      {
        id: '1',
        label: 'Test Answer',
        answer: 'Test answer content',
      },
    ],
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-08-10T14:12:39.554Z'))

    // Default mock behavior - return the input unchanged
    mockedProcessFormAnswersForSize.mockImplementation(
      (formAnswerGroup) => formAnswerGroup,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('successful webhook processing', () => {
    it('should process form answer group and call processFormAnswersForSize with correct parameters', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: mockFormAnswerGroup,
          },
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      // Verify that processFormAnswersForSize was called with correct parameters
      expect(mockedProcessFormAnswersForSize).toHaveBeenCalledWith(
        mockFormAnswerGroup,
        20,
      )

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          lockedFormAnswerGroupId: '3456',
          lockedFormAnswerGroup: JSON.stringify(mockFormAnswerGroup),
        },
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: 'user_456',
        },
      })
    })

    it('should work when formAnswerMaxSizeKB is not configured', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: mockFormAnswerGroup,
          },
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            // formAnswerMaxSizeKB not set
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      // Verify that processFormAnswersForSize was called with undefined maxSizeKB
      expect(mockedProcessFormAnswersForSize).toHaveBeenCalledWith(
        mockFormAnswerGroup,
        undefined,
      )

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          lockedFormAnswerGroupId: '3456',
          lockedFormAnswerGroup: JSON.stringify(mockFormAnswerGroup),
        },
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: 'user_456',
        },
      })
    })

    it('should use processed form answer group from utility function', async () => {
      const processedFormAnswerGroup = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Test Answer',
            answer:
              '<div>Form answer max size exceeded. Size: 25KB, max size allowed: 20KB.</div>',
          },
        ],
      }

      mockedProcessFormAnswersForSize.mockReturnValue(processedFormAnswerGroup)
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: mockFormAnswerGroup,
          },
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          lockedFormAnswerGroupId: '3456',
          lockedFormAnswerGroup: JSON.stringify(processedFormAnswerGroup),
        },
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: 'user_456',
        },
      })
    })

    it('should handle form answer group without user', async () => {
      const formAnswerGroupWithoutUser = {
        id: '3456',
        form_answers: [
          {
            id: '1',
            label: 'Test Answer',
            answer: 'Test answer content',
          },
        ],
      }

      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: formAnswerGroupWithoutUser,
          },
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          lockedFormAnswerGroupId: '3456',
          lockedFormAnswerGroup: JSON.stringify(formAnswerGroupWithoutUser),
        },
        // No patient_identifier should be included when user is missing
      })
    })
  })

  describe('error handling', () => {
    it('should handle SDK errors properly', async () => {
      const error = new Error('GraphQL Error')

      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockRejectedValue(error),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith(formatError(error))
    })

    it('should handle case when form answer group is not found', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: null,
          },
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith(
        formatError(new Error('Form answer group not found')),
      )
    })

    it('should handle case when response data is undefined', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: undefined,
        }),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload: basePayload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
            formAnswerMaxSizeKB: '20',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith(
        formatError(new Error('Form answer group not found')),
      )
    })
  })
})
