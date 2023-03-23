import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { updatePatient } from "../updatePatient"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('updatePatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should update patient", async () => {
    await updatePatient.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
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
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updatePatient).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
