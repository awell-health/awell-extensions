import { testPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { getFormAnswers } from './getFormAnswers'
import { processFormAnswersForSize } from '../../lib/helpers/processFormAnswers'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')
jest.mock('../../lib/helpers/processFormAnswers')

const mockedProcessFormAnswersForSize = jest.mocked(processFormAnswersForSize)

describe('Healthie - Get form answers', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(getFormAnswers)

  const mockFormAnswerGroup = {
    id: '462349',
    user: { id: 'user_123' },
    form_answers: [
      {
        id: '1',
        label: 'Test Answer 1',
        answer: 'Small answer content',
      },
      {
        id: '2',
        label: 'Test Answer 2',
        answer: 'Another small answer',
      },
    ],
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()

    // Default mock behavior - return the input unchanged
    mockedProcessFormAnswersForSize.mockImplementation(
      (formAnswerGroup) => formAnswerGroup,
    )
  })

  describe('successful form answer retrieval', () => {
    it('should retrieve form answers and process them for size limits', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: mockFormAnswerGroup,
          },
        }),
      }))

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            formAnswerMaxSizeKB: '20',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      // Verify that processFormAnswersForSize was called with correct parameters
      expect(mockedProcessFormAnswersForSize).toHaveBeenCalledWith(
        mockFormAnswerGroup,
        20,
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          formAnswers: JSON.stringify(mockFormAnswerGroup.form_answers),
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

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            // formAnswerMaxSizeKB not set
          },
        },
        onComplete,
        onError,
        helpers,
      })

      // Verify that processFormAnswersForSize was called with undefined maxSizeKB
      expect(mockedProcessFormAnswersForSize).toHaveBeenCalledWith(
        mockFormAnswerGroup,
        undefined,
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          formAnswers: JSON.stringify(mockFormAnswerGroup.form_answers),
        },
      })
    })

    it('should use processed form answers from utility function', async () => {
      const processedFormAnswerGroup = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Test Answer 1',
            answer:
              '<div>Form answer max size exceeded. Size: 25000 bytes, max size allowed: 20480 bytes.</div>',
          },
          {
            id: '2',
            label: 'Test Answer 2',
            answer: 'Another small answer',
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

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            formAnswerMaxSizeKB: '20',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          formAnswers: JSON.stringify(processedFormAnswerGroup.form_answers),
        },
      })
    })
  })

  describe('error handling', () => {
    it('should handle SDK errors properly', async () => {
      const error = new Error('GraphQL Error')

      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockRejectedValue(error),
      }))

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            formAnswerMaxSizeKB: '20',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'GraphQL Error' },
            error: {
              category: 'BAD_REQUEST',
              message: 'GraphQL Error',
            },
          },
        ],
      })
    })

    it('should handle case when form answer group is not found', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: {
            formAnswerGroup: null,
          },
        }),
      }))

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            formAnswerMaxSizeKB: '20',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Form answer group not found for id: 462349' },
            error: {
              category: 'BAD_REQUEST',
              message: 'Form answer group not found for id: 462349',
            },
          },
        ],
      })
    })

    it('should handle case when response data is undefined', async () => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        getFormAnswerGroup: jest.fn().mockResolvedValue({
          data: undefined,
        }),
      }))

      await action.onEvent({
        payload: {
          ...testPayload,
          fields: {
            id: '462349',
          },
          settings: {
            apiUrl: 'https://staging-api.gethealthie.com/graphql',
            apiKey: 'test-api-key',
            formAnswerMaxSizeKB: '20',
          },
        },
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Form answer group not found for id: 462349' },
            error: {
              category: 'BAD_REQUEST',
              message: 'Form answer group not found for id: 462349',
            },
          },
        ],
      })
    })
  })
})
