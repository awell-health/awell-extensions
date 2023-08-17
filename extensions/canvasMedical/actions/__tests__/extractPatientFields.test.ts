import { extractPatientInfo } from '../extractPatientFields'
import { samplePatientResource } from '../../__mocks__/patient'
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
      patient_data: JSON.stringify(samplePatientResource),
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
        patientId: samplePatientResource.id,
        firstName: samplePatientResource.name?.[0].given.join(' '),
        lastName: samplePatientResource.name?.[0].family,
        dob: samplePatientResource.birthDate,
        email: samplePatientResource.telecom?.[1].value,
        phone: samplePatientResource.telecom?.[0].value,
      },
    })
  })
})
