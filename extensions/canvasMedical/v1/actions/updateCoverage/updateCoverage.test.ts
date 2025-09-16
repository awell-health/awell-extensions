import { generateTestPayload } from '@/tests'
import {
  mockedCoverageId,
  mockedUpdateCoverageData,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { updateCoverage } from './updateCoverage'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateCoverage', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updateCoverage)
  const payload = {
    settings: mockedSettings,
    fields: mockedUpdateCoverageData,
  }

  it('should update coverage', async () => {
    await updateCoverage.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { coverageId: mockedCoverageId },
    })
  })
})
