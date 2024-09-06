import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../lib/sdk/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/generated/__mocks__/sdk'
import { cancelAppointment } from '../cancelAppointment'

jest.mock('../../lib/sdk/generated/sdk')
jest.mock('../../lib/sdk/graphqlClient')

describe('cancelAppointment action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should cancel an appointment', async () => {
    await cancelAppointment.onActivityCreated!(
      generateTestPayload({
        fields: {
          id: 'appointment-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updateAppointment).toHaveBeenCalledWith({
      input: {
        id: 'appointment-1',
        pm_status: 'Cancelled',
      },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
