import { makeAPIClient } from '../../client'
import { getReferralOrder as action } from './getReferralOrder'
import { TestHelpers } from '@awell-health/extensions-core'
import { referralOrderMockResponse } from './__testdata__/referralOrder.mock'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => ({
    getReferralOrder: jest.fn().mockResolvedValue(referralOrderMockResponse),
  })),
}))

const mockedSdk = jest.mocked(makeAPIClient)

describe('Elation - Get referral order', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should return the correct referral order', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          referralOrderId: 123,
        },
        settings: {
          client_id: 'clientId',
          client_secret: 'clientSecret',
          username: 'username',
          password: 'password',
          auth_url: 'authUrl',
          base_url: 'baseUrl',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        letterId: '142687933038810',
        patientId: '141624181522433',
        consultantName: 'Pharmacy (Suvida)',
        practice: '141114865745924',
        diagnosisCodes: '["E11.9","Z71.89"]',
        diagnosisLabels:
          '["Type 2 diabetes mellitus without complications","Other specified counseling"]',
      },
    })
  })
})
