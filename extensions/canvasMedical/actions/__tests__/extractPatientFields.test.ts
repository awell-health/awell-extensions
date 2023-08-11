import { extractPatientInfo } from '../extractPatientFields'
import { patientResource } from '../../__mocks__/patient'
import { generateTestPayload } from '../../../../src/tests'

jest.mock('../../client')

describe('extractPatientFields', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: {
      client_id: '123',
      client_secret: '123',
      base_url: 'https://example.com',
      auth_url: 'https://example.com/auth/token',
      audience: undefined,
    },
    fields: {
      patient_data: JSON.stringify(patientResource),
    },
  }

  it('should extract patient data', async () => {
    await extractPatientInfo.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patient_id: patientResource.id,
        dob: patientResource.birthDate,
        email: patientResource.telecom?.[1].value,
        first_name: patientResource.name?.[0].given.join(' '),
        last_name: patientResource.name?.[0].family,
        phone: patientResource.telecom?.[0].value,
      },
    })
  })
})
