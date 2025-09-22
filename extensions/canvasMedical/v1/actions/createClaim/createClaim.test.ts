import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
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
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createClaim)

  const payload = {
    settings: mockedSettings,
    fields: mockedCreateClaimData,
  }

  it('should create claim', async () => {
    await createClaim.onEvent!({
      payload: generateTestPayload(payload),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        claimId: mockedClaimId,
      },
    })
  })
})
