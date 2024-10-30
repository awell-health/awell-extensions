import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { assignPatientToGroup } from '../assignPatientToGroup'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('assignPatientToGroup action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    { inputGroupId: undefined, assignedGroupId: '' },
    { inputGroupId: '', assignedGroupId: '' },
    { inputGroupId: 'xyz123', assignedGroupId: 'xyz123' },
  ])(
    '$#. When groupId equals "$inputGroupId", then it should be called with "$assignedGroupId"',
    async ({ inputGroupId, assignedGroupId }) => {
      await assignPatientToGroup.onActivityCreated!(
        generateTestPayload({
          fields: {
            id: 'patient-1',
            groupId: inputGroupId,
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        }),
        onComplete,
        jest.fn()
      )

      expect(mockGetSdkReturn.updatePatient).toHaveBeenCalledWith({
        input: {
          id: 'patient-1',
          user_group_id: assignedGroupId,
        },
      })
      expect(onComplete).toHaveBeenCalled()
    }
  )
})
