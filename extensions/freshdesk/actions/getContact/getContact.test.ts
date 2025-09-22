import { TestHelpers } from '@awell-health/extensions-core'
import { FreshdeskApiClient } from '../../lib/api/client'
import { getContact as action } from './getContact'
import { GetContactResponseMock } from './__mocks__/GetContact.mock'
import { createAxiosError } from '../../../../tests'

describe('Freshdesk - Get contact', () => {
  let getContactSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      getContactSpy = jest
        .spyOn(FreshdeskApiClient.prototype, 'getContact')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(GetContactResponseMock),
        )
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            contactId: '1',
          },
          settings: {
            domain: 'domain',
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          contactData: JSON.stringify(GetContactResponseMock.data),
          name: GetContactResponseMock.data.name,
          email: GetContactResponseMock.data.email,
          customFields: JSON.stringify(
            GetContactResponseMock.data.custom_fields,
          ),
          tags: JSON.stringify(GetContactResponseMock.data.tags),
        },
      })
    })
  })

  describe('When ticket is not found', () => {
    beforeEach(() => {
      getContactSpy = jest
        .spyOn(FreshdeskApiClient.prototype, 'getContact')
        .mockImplementationOnce(
          jest
            .fn()
            .mockRejectedValue(
              createAxiosError(404, 'Not Found', JSON.stringify({})),
            ),
        )
    })

    test('Should call onError', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            contactId: '1',
          },
          settings: {
            domain: 'domain',
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: {
              en: 'Contact not found (404)',
            },
          }),
        ]),
      })
    })
  })
})
