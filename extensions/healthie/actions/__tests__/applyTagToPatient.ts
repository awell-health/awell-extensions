import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { applyTagToPatient } from "../applyTagToPatient"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('applyTagToPatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should apply tag to a patient", async () => {
    await applyTagToPatient.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
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

    expect(mockGetSdkReturn.applyTagsToUser).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
