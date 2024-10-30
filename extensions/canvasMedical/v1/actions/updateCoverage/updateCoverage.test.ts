import { generateTestPayload } from '@/tests'
import {
  mockedCoverageId,
  mockedUpdateCoverageData,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { updateCoverage } from './updateCoverage'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('updateCoverage', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: mockedUpdateCoverageData,
  }

  it('should update coverage', async () => {
    await updateCoverage.onActivityCreated!(
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
