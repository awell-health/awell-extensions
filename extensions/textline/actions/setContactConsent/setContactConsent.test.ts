import { generateTestPayload } from '@/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'
import { setContactConsent } from './setContactConsent'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../client/textLineApi', () => jest.fn(() => mockReturnValue))

describe('Set Contact Consent action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(setContactConsent)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await setContactConsent.onEvent!({
      payload: generateTestPayload({
        fields: {
          consentStatus: true,
          recipient: '+13108820245',
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 20000)

  test('Should call the onError callback when there is no recipient', async () => {
    await setContactConsent.onEvent!({
      payload: generateTestPayload({
        fields: {
          consentStatus: false,
          recipient: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no consent status', async () => {
    await setContactConsent.onEvent!({
      payload: generateTestPayload({
        fields: {
          consentStatus: undefined,
          recipient: '+13108820245',
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
