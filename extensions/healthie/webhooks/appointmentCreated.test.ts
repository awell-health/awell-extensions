import { getSdk } from '../lib/sdk/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../lib/sdk/generated/__mocks__/sdk'
import { appointmentCreated } from './appointmentCreated'

jest.mock('../lib/sdk/generated/sdk')
jest.mock('../lib/sdk/graphqlClient')

describe('appointmentCreated Webhook', () => {
  const onComplete = jest.fn()
  const mockOnSuccess = jest.fn();


  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Receive a webhook', async () => {
    await appointmentCreated.onWebhookReceived(
      {
        payload: {
          resource_id: 72499,
          resource_id_type: 'Appointment',
          event_type: 'appointment.created',
        },
        settings: {
          apiUrl: 'https://api.healthieapp.com/graphql',
          apiKey: 'apiKey',
        },
        rawBody: Buffer.from(''),
        headers: {},
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getAppointment).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  test('Process a webhook success', async () => {
    await appointmentCreated.onWebhookReceived(
      {
        payload: {
          resource_id: 72499,
          resource_id_type: 'Appointment',
          event_type: 'appointment.created',
        },
        settings: {
          apiUrl: 'https://api.healthieapp.com/graphql',
          apiKey: 'apiKey',
        },
        rawBody: Buffer.from(''),
        headers: {},
      },
      mockOnSuccess,
      jest.fn()
    )

    expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
      data_points: {
        appointmentId: '72499',
        appointment: "{\"id\":\"appointment-1\",\"user\":{\"id\":\"2345\"}}",
      },
      patient_identifier: {
        system: 'https://www.gethealthie.com/',
        value: '2345', 
      },
    }));
  })

})
