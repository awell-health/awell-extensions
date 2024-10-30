import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientId,
  mockedPatientResource,
  mockedSettings,
} from '../../client/__mocks__'
import { updatePatient } from './updatePatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updatePatient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: {
      patientData: JSON.stringify(mockedPatientResource),
    },
  }

  it('should update patient', async () => {
    await updatePatient.onActivityCreated!(
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
