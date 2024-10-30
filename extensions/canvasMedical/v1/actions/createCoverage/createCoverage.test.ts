import { generateTestPayload } from '@/tests'
import {
  mockedCreateCoverageData,
  mockedCoverageId,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { createCoverage } from './createCoverage'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createCoverage', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: mockedCreateCoverageData,
  }

  it('should create coverage', async () => {
    await createCoverage.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: { coverageId: mockedCoverageId },
    })
  })
})
