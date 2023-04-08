import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { cancelAppointment } from "../cancelAppointment"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('cancelAppointment action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    (getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks();
  })

  test("Should cancel an appointment", async () => {
    await cancelAppointment.onActivityCreated(
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          id: 'appointment-1'
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url'
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updateAppointment).toHaveBeenCalledWith({
      input: {
        id: 'appointment-1',
        pm_status: 'Cancelled'
      }
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
