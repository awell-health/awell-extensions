import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { updatePatient } from '../updatePatient/updatePatient'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('updatePatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should update patient', async () => {
    await updatePatient.onActivityCreated!(
      generateTestPayload({
        fields: {
          id: 'patient-1',
          first_name: 'test',
          last_name: 'test',
          legal_name: undefined,
          email: undefined,
          phone_number: undefined,
          provider_id: undefined,
          gender: undefined,
          gender_identity: undefined,
          height: undefined,
          sex: undefined,
          user_group_id: undefined,
          active: true,
          dob: '1990-01-01',
          skipped_email: false,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updatePatient).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
