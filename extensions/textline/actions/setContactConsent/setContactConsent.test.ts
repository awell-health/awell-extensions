import { generateTestPayload } from '@/tests'
import { mockReturnValue } from '../../client/__mocks__/textLineApi'
import { setContactConsent } from './setContactConsent'

jest.mock('../../client/textLineApi', () => jest.fn(() => mockReturnValue))

describe('Set Contact Consent action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await setContactConsent.onActivityCreated!(
      generateTestPayload({
        fields: {
          consentStatus: true,
          recipient: '+13108820245',
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  }, 20000)

  test('Should call the onError callback when there is no recipient', async () => {
    await setContactConsent.onActivityCreated!(
      generateTestPayload({
        fields: {
          consentStatus: false,
          recipient: undefined,
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('Should call the onError callback when there is no consent status', async () => {
    await setContactConsent.onActivityCreated!(
      generateTestPayload({
        fields: {
          consentStatus: undefined,
          recipient: '+13108820245',
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
