import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { updatePatientQuickNote } from '../updatePatientQuickNote'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('createMetricEntry action', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    updatePatientQuickNote,
  )

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should update patient quick note', async () => {
    await updatePatientQuickNote.onEvent!({
      payload: generateTestPayload({
        fields: {
          patientId: 'patient-id',
          quickNote: 'QUICK NOTE',
          overwrite: true,
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
    expect(onComplete).toBeCalledTimes(1)
    expect(onError).toBeCalledTimes(0)
  })
})
