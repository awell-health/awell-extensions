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

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a charting note', async () => {
    await createChartingNote.onEvent!({
      payload: generateTestPayload({
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
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
