import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { createChartingNote } from '../createChartingNote'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('createChartingNote action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createChartingNote)

  const payload = generateTestPayload({
    fields: {
      form_id: 'form-template-1',
      healthie_patient_id: 'patient-1',
      note_content: 'Test content',
      marked_locked: true,
      appointment_id: 'appointment-1',
    },
    settings: {
      apiKey: 'apiKey',
      apiUrl: 'test-url',
      formAnswerMaxSizeKB: undefined,
    },
  })

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a charting note', async () => {
    mockGetSdkReturn.createFormAnswerGroup.mockReturnValueOnce({
      data: {
        createFormAnswerGroup: {
          form_answer_group: { id: 'form-answer-group-1' },
        },
      },
    })

    await createChartingNote.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: { formAnswerGroupId: 'form-answer-group-1' },
      }),
    )
  })

  test('Should complete without a formAnswerGroupId when Healthie returns no form answer group', async () => {
    await createChartingNote.onEvent!({
      payload,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ data_points: undefined }),
    )
    expect(onError).not.toHaveBeenCalled()
  })
})
