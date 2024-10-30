import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientId,
  mockedPatientResource,
  mockedSettings,
} from '../../client/__mocks__'
import { getPatient } from './getPatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getPatient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      patientId: mockedPatientId,
    },
  }

  it('should get patient', async () => {
    await getPatient.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: JSON.stringify(mockedPatientResource),
      },
    })
  })
})
