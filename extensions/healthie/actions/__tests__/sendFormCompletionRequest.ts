import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { sendFormCompletionRequest } from "../sendFormCompletionRequest"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('sendFormCompletionRequest action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should send form completion request", async () => {
    await sendFormCompletionRequest.onActivityCreated(
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
          form_id: 'form-template-1',
          healthie_patient_id: 'patient-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn(),
      {}
    )

    expect(mockGetSdkReturn.createFormCompletionRequest).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
