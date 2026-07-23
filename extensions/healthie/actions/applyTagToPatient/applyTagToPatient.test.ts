import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { applyTagToPatient } from '../applyTagToPatient'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('applyTagToPatient action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(applyTagToPatient)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should apply tag to a patient', async () => {
    await applyTagToPatient.onEvent!({
      payload: generateTestPayload({
        fields: {
          id: 'tag-1',
          patient_id: 'patient-1',
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

    expect(mockGetSdkReturn.applyTagsToUser).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
