import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { archivePatient } from '../archivePatient'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('archivePatient action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(archivePatient)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should archive a patient', async () => {
    await archivePatient.onEvent!({
      payload: generateTestPayload({
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          id: 'patient-1',
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

    expect(mockGetSdkReturn.updatePatient).toHaveBeenCalledWith({
      input: { id: 'patient-1', active: false },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
