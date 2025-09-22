import { TestHelpers } from '@awell-health/extensions-core'
import { FreshsalesApiClient } from '../../lib/api/client'
import { searchContactByEmail as action } from './searchContactByEmail'
import { FilteredSearchContactResponseMock } from './__mocks__/SearchContactResponse.mock'

describe('Freshsales - Search contact by email', () => {
  let searchContactByEmailSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      searchContactByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchContactByEmail')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(FilteredSearchContactResponseMock),
        )
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            email: 'testing@awellhealth.com',
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
          contactData: JSON.stringify(
            FilteredSearchContactResponseMock.data.contacts[0],
          ),
          email: FilteredSearchContactResponseMock.data.contacts[0].email,
          mobileNumber: '+19265559503',
          city: FilteredSearchContactResponseMock.data.contacts[0].city,
          country: FilteredSearchContactResponseMock.data.contacts[0].country,
          displayName:
            FilteredSearchContactResponseMock.data.contacts[0].display_name,
          firstName:
            FilteredSearchContactResponseMock.data.contacts[0].first_name,
          lastName:
            FilteredSearchContactResponseMock.data.contacts[0].last_name,
        },
        events: expect.any(Array),
      })
    })
  })

  describe('When no lead is found', () => {
    beforeEach(() => {
      searchContactByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchContactByEmail')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({
            data: {
              meta: {
                total: 0,
              },
            },
          }),
        )
    })

    test('Should call onError', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            email: 'testing@awellhealth.com',
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
              en: 'Contact not found',
            },
          }),
        ]),
      })
    })
  })

  describe('When multiple leads are found', () => {
    beforeEach(() => {
      searchContactByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchContactByEmail')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({
            data: {
              meta: {
                total: 2,
              },
            },
          }),
        )
    })

    test('Should call onError', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            email: 'testing@awellhealth.com',
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
              en: 'Multiple contacts found for the given email',
            },
          }),
        ]),
      })
    })
  })
})
