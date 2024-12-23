import { generateTestPayload } from '@/tests'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { createAppointment as actionInterface } from '.'
import { TestHelpers } from '@awell-health/extensions-core'

const mockedMutationResponse = jest.fn().mockResolvedValue({
  createAppointment: {
    appointment: {
      id: 'appointment-id-1',
    },
  },
})

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: mockedMutationResponse,
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - Create appointment', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
  })

  test('Should create an appointment', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          patientId: 'a-patient-id',
          otherPartyId: 'other-party-id',
          contactTypeId: 'contact-type-id',
          appointmentTypeId: 'appointment-type-id',
          datetime: '2024-07-09T07:49:38Z',
          notes: 'Test appointment\nNew line\n\nDouble enter after new line',
          externalVideochatUrl: 'https://example.com',
          metadata: JSON.stringify({ hello: 'world' }),
        },
        settings: {
          apiUrl: 'https://staging-api.gethealthie.com/graphql',
          apiKey: 'apiKey',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(mockedMutationResponse).toHaveBeenCalledWith({
      createAppointment: {
        __args: {
          input: {
            appointment_type_id: 'appointment-type-id',
            contact_type: 'contact-type-id',
            other_party_id: 'other-party-id',
            datetime: '2024-07-09T07:49:38Z',
            user_id: 'a-patient-id',
            metadata: '{"hello":"world"}',
            notes: 'Test appointment\nNew line\n\nDouble enter after new line',
            external_videochat_url: 'https://example.com',
          },
        },
        appointment: expect.any(Object),
      },
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentId: 'appointment-id-1',
      },
    })
  })
})
