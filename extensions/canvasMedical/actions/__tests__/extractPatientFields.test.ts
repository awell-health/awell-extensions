import { extractPatientInfo } from '../extractPatientFields'
import {
  samplePatientResource,
  minimalPatientResourceSample,
} from '../../__mocks__/patient'
import { generateTestPayload } from '../../../../src/tests'

describe('extractPatientFields', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  const settings = {
    client_id: '123',
    client_secret: '123',
    base_url: 'https://example.com',
    auth_url: 'https://example.com/auth/token',
    audience: undefined,
  }

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should extract minimal patient data', async () => {
    await extractPatientInfo.onActivityCreated(
      generateTestPayload({
        settings,
        fields: {
          patient_data: JSON.stringify(minimalPatientResourceSample),
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: minimalPatientResourceSample.id,
        firstName: minimalPatientResourceSample.name?.[0].given.join(' '),
        lastName: minimalPatientResourceSample.name?.[0].family,
        dob: minimalPatientResourceSample.birthDate,
      },
    })
  })

  it('should extract patient data', async () => {
    await extractPatientInfo.onActivityCreated(
      generateTestPayload({
        settings,
        fields: {
          patient_data: JSON.stringify(samplePatientResource),
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
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

  it('should not parse an empty JSON', async () => {
    await extractPatientInfo.onActivityCreated(
      generateTestPayload({
        settings,
        fields: {
          patient_data: JSON.stringify({}),
        },
      }),
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledTimes(0)
  })
})
