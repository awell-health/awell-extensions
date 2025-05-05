import { TestHelpers } from '@awell-health/extensions-core'
import { trackPersonEvent } from '.'
import { CustomerioTrackApiClient } from '../../lib/api/trackApiClient'
import { createAxiosError, generateTestPayload } from '../../../../tests'

jest.mock('../../lib/api/trackApiClient')

describe('Customer.io - Track person event', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(trackPersonEvent)

  const mockTrackPersonEvent = jest.fn()

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  beforeAll(() => {
    const mockedCustomerioTrackApiClient = jest.mocked(CustomerioTrackApiClient)
    mockedCustomerioTrackApiClient.mockImplementation(() => {
      return {
        trackPersonEvent: mockTrackPersonEvent,
      } as unknown as CustomerioTrackApiClient
    })
  })

  describe('Successful event tracking', () => {
    beforeEach(() => {
      mockTrackPersonEvent.mockResolvedValue({})
    })

    test('Should call the onComplete callback', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            eventName: 'test',
            identifierValue: 'test@example.com',
            personIdentifierType: 'email',
            attributes: JSON.stringify({
              hello: 'world',
            }),
          },
          settings: {
            siteId: 'siteId',
            apiKey: 'apiKey',
          },
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(mockTrackPersonEvent).toHaveBeenCalledWith({
        type: 'person',
        action: 'event',
        name: 'test',
        identifiers: {
          email: 'test@example.com',
        },
        attributes: {
          hello: 'world',
        },
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('Failed event tracking', () => {
    beforeEach(() => {
      mockTrackPersonEvent.mockRejectedValue(
        createAxiosError(
          400,
          'Bad Request',
          JSON.stringify({
            errors: [
              {
                reason: 'string',
                field: 'string',
                message: 'string',
              },
            ],
          }),
        ),
      )
    })

    test('Should throw an error', async () => {
      expect(
        extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              eventName: 'test',
              identifierValue: 'test@example.com',
              personIdentifierType: 'email',
            },
            settings: {
              siteId: 'siteId',
              apiKey: 'apiKey',
            },
          }),
          onComplete,
          onError,
          helpers,
        }),
      ).rejects.toThrow()
    })
  })
})
