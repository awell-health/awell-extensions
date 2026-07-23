import { generateTestPayload } from '@/tests'
import {
  mockedCreateCoverageData,
  mockedCoverageId,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { TestHelpers } from '@awell-health/extensions-core'
import { createCoverage } from './createCoverage'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createCoverage', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createCoverage)
  const payload = {
    settings: mockedSettings,
    fields: mockedCreateCoverageData,
  }

  it('should create coverage', async () => {
    await createCoverage.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { coverageId: mockedCoverageId },
    })
  })
})
