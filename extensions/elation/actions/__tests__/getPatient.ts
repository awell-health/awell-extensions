import { getPatient } from '../getPatient'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { patientExample } from '../../__mocks__/constants'
import { ZodError } from 'zod'

jest.mock('../../client')

describe('Simple get patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    await getPatient.onActivityCreated!(
      {
        fields: {
          patientId: 127385972,
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toBeCalledWith({
      data_points: {
        firstName: patientExample.first_name,
        lastName: patientExample.last_name,
        dob: patientExample.dob,
        sex: patientExample.sex,
        primaryPhysicianId: String(patientExample.primary_physician),
        caregiverPracticeId: String(patientExample.caregiver_practice),
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
      },
    })
  })

  test('Should provide good error messaging', async () => {
    const onError = jest
      .fn()
      .mockImplementation((obj: { events: ActivityEvent[] }) => {
        return obj.events[0].error?.message
      })
    const activity = getPatient.onActivityCreated!(
      {
        fields: {
          patientId: '',
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    await expect(activity).rejects.toThrow(ZodError)
  })
})
