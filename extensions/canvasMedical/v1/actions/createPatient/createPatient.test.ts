import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientData,
  mockedPatientId,
  mockedSettings,
} from '../../client/__mocks__'
import { createPatient } from './createPatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createPatient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      patientData: JSON.stringify(mockedPatientData),
    },
  }

  it('should create patient', async () => {
    await createPatient.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { patientId: mockedPatientId },
    })
  })
})
