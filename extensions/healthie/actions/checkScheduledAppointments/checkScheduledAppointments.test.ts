import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../lib/sdk/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/generated/__mocks__/sdk'
import { checkScheduledAppointments } from '../checkScheduledAppointments'

jest.mock('../../lib/sdk/generated/sdk')
jest.mock('../../lib/sdk/graphqlClient')

describe('checkScheduledAppointments action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    const mockSdk = getSdk as jest.Mock
    mockSdk.mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when there is active future appointment with appointment_type_id', () => {
    it('should return call onComplete with isScheduled data points set to true', async () => {
      await checkScheduledAppointments.onActivityCreated(
        generateTestPayload({
          fields: {
            patientId: 'patient-1',
            appointmentTypeId: 'appointment-type-1',
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        }),
        onComplete,
        jest.fn()
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isScheduled: 'true',
        },
      })
    })
  })
  describe('when there is not active future appointment with appointment_type_id', () => {
    it('should return call onComplete with isScheduled data points set to false', async () => {
      await checkScheduledAppointments.onActivityCreated(
        generateTestPayload({
          fields: {
            patientId: 'patient-1',
            appointmentTypeId: 'appointment-type-2',
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        }),
        onComplete,
        jest.fn()
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isScheduled: 'false',
        },
      })
    })
  })
})
