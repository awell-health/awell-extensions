import { getPatient } from '../getPatient'
import { samplePatientResource, samplePatientId } from '../../__mocks__/patient'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('getPatient', () => {
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
      patientId: samplePatientId.id,
    },
  }

  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should return patient', async () => {
    await getPatient.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { patient_data: JSON.stringify(samplePatientResource) },
    })
  })
})
