import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { removeTagFromPatient } from '../removeTagFromPatient'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('removeTagFromPatient action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(removeTagFromPatient)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should remove tag from a patient', async () => {
    await removeTagFromPatient.onEvent!({
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

    expect(mockGetSdkReturn.removeTagFromUser).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
