import { TestHelpers } from '@awell-health/extensions-core'
import { ZoomApiClient } from '../../lib/api/client'
import { sendSms as action } from './sendSms'
import { createAxiosError } from '../../../../tests'
import { AxiosError } from 'axios'

jest.mock('../../lib/api/client')

describe('Zoom - Send SMS', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockedZoomApiClient = jest.mocked(ZoomApiClient)
  const mockSendSms = jest.fn()

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    mockedZoomApiClient.mockImplementation(() => {
      return {
        sendSms: mockSendSms,
      } as unknown as ZoomApiClient
    })
  })

  describe('When the request is successful', () => {
    beforeAll(() => {
      mockSendSms.mockResolvedValue({
        data: [
          {
            contact_center_number: '+12090000000',
            consumer_number: '+12090001111',
            message_id: 'IQ-dhfaoufosadfb',
            success: true,
          },
        ],
      })
    })

    test('It should call the onComplete callback', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            contactCenterNumber: '+12090000000',
            to: '+12090001111',
            body: 'Hello, world!',
          },
          settings: {
            accountId: 'account-id',
            clientId: 'client-id',
            clientSecret: 'client-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(mockSendSms).toHaveBeenCalledWith({
        contact_center_number: '+12090000000',
        consumer_numbers: ['+12090001111'],
        body: 'Hello, world!',
      })
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('When the request is not successful', () => {
    describe('When success is false', () => {
      beforeAll(() => {
        mockSendSms.mockResolvedValue({
          data: [
            {
              contact_center_number: '+12090000000',
              consumer_number: '+12090001111',
              description:
                'Invalid consumer number. The format of the consumer number used is incorrect. E.164 format is required',
              success: false,
            },
          ],
        })
      })

      test('It should call the onError callback', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              contactCenterNumber: '+12090000000',
              to: '+12090001111',
              body: 'Hello, world!',
            },
            settings: {
              accountId: 'account-id',
              clientId: 'client-id',
              clientSecret: 'client-secret',
            },
          } as any,
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })

        expect(onComplete).not.toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'Invalid consumer number. The format of the consumer number used is incorrect. E.164 format is required',
              },
            },
          ],
        })
      })
    })

    describe('When the Zoom API throws an error', () => {
      beforeAll(() => {
        mockSendSms.mockRejectedValue(
          createAxiosError(
            400,
            'Bad request',
            JSON.stringify({
              code: 1404,
              message: '`contact_center_number` not found',
            }),
          ),
        )
      })

      test('It should throw an AxiosError', async () => {
        // Error is handled in Extensions Core and thrown to the user in the UI
        expect(
          extensionAction.onEvent({
            payload: {
              fields: {
                contactCenterNumber: '+12090000000',
                to: '+12090001111',
                body: 'Hello, world!',
              },
              settings: {
                accountId: 'account-id',
                clientId: 'client-id',
                clientSecret: 'client-secret',
              },
            } as any,
            onComplete,
            onError,
            helpers,
            attempt: 1,
          }),
        ).rejects.toThrow(AxiosError)
      })
    })
  })
})
