import { updatePatient } from '../updatePatient'
import { patientResource } from '../../__mocks__/patient'
import { generateTestPayload } from '../../../../src/tests'
import { makeAPIClient } from '../../client'
import { mockMakeAPIClient } from '../../__mocks__/canvasApiClient'

jest.mock('../../client')

describe('updatePatient', () => {
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
  beforeAll(async () => {
    ;(makeAPIClient as jest.Mock).mockImplementation(mockMakeAPIClient)
  })
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  it('should update patient', async () => {
    await updatePatient.onActivityCreated(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { patient_id: patientResource.id },
    })
  })
})
