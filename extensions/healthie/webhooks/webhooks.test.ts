import { getSdk } from '../lib/sdk/generated/sdk'
import { HEALTHIE_IDENTIFIER } from '../lib/types'
import { formatError } from '../lib/sdk/errors'
import { testCases } from './tests/testCases'
import { processWebhook } from './tests/helpers'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../lib/sdk/generated/sdk')
jest.mock('../lib/sdk/graphqlClient')

testCases.forEach(({ webhook, payload, sdkMocks, dataPoints }) => {
  describe(webhook.key, () => {
    const {
      onComplete: onSuccess,
      onError,
      helpers,
      clearMocks,
      extensionWebhook,
    } = TestHelpers.fromWebhook(webhook)

    beforeAll(() => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        [sdkMocks[0].method]: jest.fn().mockResolvedValue(sdkMocks[0].response),
      }))
    })

    beforeEach(() => {
      clearMocks()
      jest.clearAllMocks()
      // date object is irrelevant for this test
      // and occassianlly it fails by fractional second hence mocking it
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-08-10T14:12:39.554Z'))
    })

    it('should handle success', async () => {
      await extensionWebhook.onEvent({
        payload: {
          payload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      const { user_id, data_points } = processWebhook(
        sdkMocks,
        dataPoints,
        payload.resource_id.toString()
      )

      expect(onSuccess).toHaveBeenCalledWith({
        data_points,
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: user_id,
        },
      })
    })

    it('should handle error', async () => {
      const error = new Error('Test Error')

      ;(getSdk as jest.Mock).mockImplementation(() => ({
        [sdkMocks[0].method]: jest.fn().mockRejectedValue(error),
      }))

      await extensionWebhook.onEvent({
        payload: {
          payload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith(formatError(error))
    })
  })
})
