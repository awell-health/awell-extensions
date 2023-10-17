import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { searchAppointments } from './searchAppointments'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('searchAppointments.test action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should search appointments', async () => {
    await searchAppointments.onActivityCreated(
      generateTestPayload({
        fields: {
          userId: '181373',
          filter: 'all',
          startDate: '2023-09-21 09:30:00 -0400',
          endDate: '2023-09-21 11:00:00 -0400',
          timezone: 'America/New_York',
          appointmentTypeId: '81833',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.appointments).toHaveBeenCalled()
    expect(onComplete).toBeCalledTimes(1)
    expect(onError).toBeCalledTimes(0)
  })

  test('Should call onError when time zone is invalid', async () => {
    await searchAppointments.onActivityCreated(
      generateTestPayload({
        fields: {
          userId: '181373',
          filter: 'all',
          startDate: '2023-09-21 09:30:00 -0400',
          endDate: '2023-09-21 11:00:00 -0400',
          timezone: 'NonExistent/New_York',
          appointmentTypeId: '81833',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )

    expect(onError).toBeCalledTimes(1)
    expect(onComplete).toBeCalledTimes(0)
  })
})
