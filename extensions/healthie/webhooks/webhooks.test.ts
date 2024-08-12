import { getSdk } from '../lib/sdk/generated/sdk'
import { HEALTHIE_IDENTIFIER } from '../lib/types'
import { formatError } from '../lib/sdk/errors'
import { testCases } from './tests/testCases'
import { processWebhook } from './tests/helpers'

jest.mock('../lib/sdk/generated/sdk')
jest.mock('../lib/sdk/graphqlClient')

testCases.forEach(({ webhook, payload, sdkMocks, dataPoints }) => {
  describe(webhook.key, () => {
    beforeAll(() => {
      ;(getSdk as jest.Mock).mockImplementation(() => ({
        [sdkMocks[0].method]: jest.fn().mockResolvedValue(sdkMocks[0].response),
      }))
    })

    beforeEach(() => {
      jest.clearAllMocks()
      // date object is irrelevant for this test
      // and occassianlly it fails by fractional second hence mocking it
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-08-10T14:12:39.554Z'))
    })

    it('should handle success', async () => {
      const onSuccess = jest.fn()
      const onError = jest.fn()

      await webhook.onWebhookReceived(
        {
          payload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError
      )

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
      const onSuccess = jest.fn()
      const onError = jest.fn()

      const error = new Error('Test Error')

      ;(getSdk as jest.Mock).mockImplementation(() => ({
        [sdkMocks[0].method]: jest.fn().mockRejectedValue(error),
      }))

      await webhook.onWebhookReceived(
        {
          payload,
          settings: {
            apiUrl: 'https://api.healthieapp.com/graphql',
            apiKey: 'apiKey',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError
      )

      expect(onError).toHaveBeenCalledWith(formatError(error))
    })
  })
})
