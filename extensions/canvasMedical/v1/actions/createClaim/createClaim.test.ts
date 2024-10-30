import { generateTestPayload } from '@/tests'
import {
  mockedClaimId,
  mockedCreateClaimData,
  mockedMakeAPIClient,
  mockedSettings,
} from '../../client/__mocks__'
import { createClaim } from './createClaim'

jest.mock('../../client', () => ({
  ...jest.requireActual('../../client'),
  makeAPIClient: mockedMakeAPIClient,
}))

describe('createClaim', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const payload = {
    settings: mockedSettings,
    fields: mockedCreateClaimData,
  }

  it('should create claim', async () => {
    await createClaim.onActivityCreated!(
      generateTestPayload(payload),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        claimId: mockedClaimId,
      },
    })
  })
})
