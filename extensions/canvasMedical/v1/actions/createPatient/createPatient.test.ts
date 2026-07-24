import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientData,
  mockedPatientId,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createPatient } from './createPatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createPatient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createPatient)
  const payload = {
    settings: mockedSettings,
    fields: {
      patientData: JSON.stringify(mockedPatientData),
    },
  }

  it('should create patient', async () => {
    await createPatient.onEvent!({
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
