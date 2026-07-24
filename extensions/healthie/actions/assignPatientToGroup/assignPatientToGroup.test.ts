import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { assignPatientToGroup } from '../assignPatientToGroup'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('assignPatientToGroup action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(assignPatientToGroup)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test.each([
    { inputGroupId: undefined, assignedGroupId: '' },
    { inputGroupId: '', assignedGroupId: '' },
    { inputGroupId: 'xyz123', assignedGroupId: 'xyz123' },
  ])(
    '$#. When groupId equals "$inputGroupId", then it should be called with "$assignedGroupId"',
    async ({ inputGroupId, assignedGroupId }) => {
      await assignPatientToGroup.onEvent!({
        payload: generateTestPayload({
          fields: {
            id: 'patient-1',
            groupId: inputGroupId,
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
        input: {
          id: 'patient-1',
          user_group_id: assignedGroupId,
        },
      })
      expect(onComplete).toHaveBeenCalled()
    },
  )
})
