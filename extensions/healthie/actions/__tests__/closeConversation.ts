import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { closeConversation } from "../closeConversation"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('closeConversation action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should close a conversation", async () => {
    await closeConversation.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          id: 'patient-1',
          provider_id: 'provider-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updateConversation).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
