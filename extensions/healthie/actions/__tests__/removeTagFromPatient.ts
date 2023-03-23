import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { removeTagFromPatient } from "../removeTagFromPatient"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('removeTagFromPatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should remove tag from a patient", async () => {
    await removeTagFromPatient.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          id: 'tag-1',
          patient_id: 'patient-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.removeTagFromUser).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
