import { TestHelpers } from '@awell-health/extensions-core'
import { FreshsalesApiClient } from '../../lib/api/client'
import { searchLeadByEmail as action } from './searchLeadByEmail'
import { FilteredSearchLeadResponseMock } from './__mocks__/SearchLeadResponse.mock'

describe('Freshsales - Search lead by email', () => {
  let searchLeadByEmailSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      searchLeadByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchLeadByEmail')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(FilteredSearchLeadResponseMock),
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
          leadData: JSON.stringify(
            FilteredSearchLeadResponseMock.data.leads[0],
          ),
          email: FilteredSearchLeadResponseMock.data.leads[0].email,
          mobileNumber: undefined,
          city: FilteredSearchLeadResponseMock.data.leads[0].city,
          country: undefined,
          displayName:
            FilteredSearchLeadResponseMock.data.leads[0].display_name,
          firstName: FilteredSearchLeadResponseMock.data.leads[0].first_name,
          lastName: FilteredSearchLeadResponseMock.data.leads[0].last_name,
        },
        events: expect.any(Array),
      })
    })
  })

  describe('When no lead is found', () => {
    beforeEach(() => {
      searchLeadByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchLeadByEmail')
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
              en: 'Lead not found',
            },
          }),
        ]),
      })
    })
  })

  describe('When multiple leads are found', () => {
    beforeEach(() => {
      searchLeadByEmailSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'searchLeadByEmail')
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
              en: 'Multiple leads found for the given email',
            },
          }),
        ]),
      })
    })
  })
})
