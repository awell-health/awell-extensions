import { generateTestPayload } from '@/tests'
import {
  mockedMakeAPIClient,
  mockedPatientId,
  mockedPatientResource,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { getPatient } from './getPatient'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('getPatient', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getPatient)
  const payload = {
    settings: mockedSettings,
    fields: {
      patientId: mockedPatientId,
    },
  }

  it('should get patient', async () => {
    await getPatient.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientData: JSON.stringify(mockedPatientResource),
      },
    })
  })
})
