import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../lib/sdk/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/generated/__mocks__/sdk'
import { createAppointment } from '.'

jest.mock('../../lib/sdk/generated/sdk')
jest.mock('../../lib/sdk/graphqlClient')

describe('Create appointment action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a task', async () => {
    await createAppointment.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'a-patient-id',
          otherPartyId: 'other-party-id',
          contactTypeId: 'contact-type-id',
          appointmentTypeId: 'appointment-type-id',
          datetime: '2024-07-09T07:49:38Z',
          metadata: JSON.stringify({ hello: 'world' }),
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.createAppointment).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentId: 'appointment-id-1',
      },
    })
  })
})
