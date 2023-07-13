import { getPatient } from '../getPatient'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { patientExample } from '../../__mocks__/constants'

jest.mock('../../client')

describe('Simple get patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    await getPatient.onActivityCreated(
      {
        fields: {
          patientId: '1',
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
        dateOfBirth: patientExample.date_of_birth,
        gender: patientExample.gender,
        ethnicity: patientExample.ethnicity,
        race: patientExample.race,
        preferredLanguage: patientExample.preferred_language,
        chartId: patientExample.chart_id,
        doctorId: String(patientExample.doctor),
        email: patientExample.email,
      },
    })
  })

  test('Should provide good error messaging', async () => {
    const onError = jest
      .fn()
      .mockImplementation((obj: { events: ActivityEvent[] }) => {
        return obj.events[0].error?.message
      })
    await getPatient.onActivityCreated(
      {
        fields: {
          patientId: '',
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveReturnedWith(
      'Validation error: Requires a valid ID (number)'
    )
  })
})
