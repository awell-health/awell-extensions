import { generateTestPayload } from '@/tests'
import {
  mockedMinimalPatientResource,
  mockedPatientResource,
  mockedSettings,
} from '../../client/__mocks__'
import { extractPatientInfo } from './extractPatientInfo'

describe('extractPatientFields', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should extract minimal patient data', async () => {
    await extractPatientInfo.onActivityCreated!(
      generateTestPayload({
        settings: mockedSettings,
        fields: {
          patientData: JSON.stringify(mockedMinimalPatientResource),
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: mockedMinimalPatientResource.id,
        firstName: mockedMinimalPatientResource.name?.[0].given.join(' '),
        lastName: mockedMinimalPatientResource.name?.[0].family,
        dob: mockedMinimalPatientResource.birthDate,
      },
    })
  })

  it('should extract patient data', async () => {
    await extractPatientInfo.onActivityCreated!(
      generateTestPayload({
        settings: mockedSettings,
        fields: {
          patientData: JSON.stringify(mockedPatientResource),
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(0)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: mockedPatientResource.id,
        firstName: mockedPatientResource.name?.[0].given.join(' '),
        lastName: mockedPatientResource.name?.[0].family,
        dob: mockedPatientResource.birthDate,
        email: mockedPatientResource.telecom?.[1].value,
        phone: mockedPatientResource.telecom?.[0].value,
      },
    })
  })

  it('should not parse an empty JSON', async () => {
    await extractPatientInfo.onActivityCreated!(
      generateTestPayload({
        settings: mockedSettings,
        fields: {
          patientData: JSON.stringify({}),
        },
      }),
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledTimes(0)
  })
})
