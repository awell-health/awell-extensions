import { TestHelpers } from '@awell-health/extensions-core'

import { getPatient as action } from './getPatient'
import { patientExample } from '../../__mocks__/constants'
import { testPayload } from '../../../../tests'

jest.mock('../../client')

describe('Elation - Get patient', () => {
  const {
    extensionAction: getPatient,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should call onComplete when successful', async () => {
    await getPatient.onEvent({
      payload: {
        ...testPayload,
        fields: { patientId: 123 },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        firstName: patientExample.first_name,
        lastName: patientExample.last_name,
        dob: patientExample.dob,
        sex: patientExample.sex,
        primaryPhysicianId: String(patientExample.primary_physician),
        caregiverPracticeId: String(patientExample.caregiver_practice),
        preferredServiceLocationId: String(
          patientExample.preferred_service_location,
        ),
        mobilePhone: '+12133734253',
        email: 'john@doe.com',
        middleName: patientExample.middle_name,
        actualName: patientExample.actual_name,
        genderIdentity: patientExample.gender_identity,
        legalGenderMarker: patientExample.legal_gender_marker,
        pronouns: patientExample.pronouns,
        sexualOrientation: patientExample.sexual_orientation,
        ssn: patientExample.ssn,
        ethnicity: patientExample.ethnicity,
        race: patientExample.race,
        preferredLanguage: patientExample.preferred_language,
        notes: patientExample.notes,
        previousFirstName: patientExample.previous_first_name,
        previousLastName: patientExample.previous_last_name,
        status: patientExample.patient_status?.status,
      }),
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when required fields are missing', async () => {
    await getPatient.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: undefined,
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId has an invalid format', async () => {
    await getPatient.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: {
            value: 1234,
          },
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
