import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientId,
  mockedPatientResource,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { updatePatient } from './updatePatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updatePatient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updatePatient)
  const payload = {
    settings: mockedSettings,
    fields: {
      patientData: JSON.stringify(mockedPatientResource),
    },
  }

  it('should update patient', async () => {
    await updatePatient.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { patientId: mockedPatientId },
    })
  })
})
