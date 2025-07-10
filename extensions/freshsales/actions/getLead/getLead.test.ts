import { TestHelpers } from '@awell-health/extensions-core'
import { FreshsalesApiClient } from '../../lib/api/client'
import { getLead as action } from './getLead'
import { GetLeadResponseMock } from './__mocks__/GetLeadResponse.mock'
import { createAxiosError } from '../../../../tests'

describe('Freshsales - Get lead', () => {
  let getLeadSpy: jest.SpyInstance

  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      getLeadSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'getLead')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue(GetLeadResponseMock),
        )
    })

    test('Should work', async () => {
      await sendCall.onEvent({
        payload: {
          fields: {
            leadId: '1',
          },
          settings: {
            domain: 'domain',
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          leadData: JSON.stringify(GetLeadResponseMock.data),
          email: GetLeadResponseMock.data.lead.email,
          mobileNumber: '+19266529503',
          address: GetLeadResponseMock.data.lead.address,
          city: GetLeadResponseMock.data.lead.city,
          state: GetLeadResponseMock.data.lead.state,
          zipcode: GetLeadResponseMock.data.lead.zipcode,
          country: GetLeadResponseMock.data.lead.country,
          timeZone: undefined,
          displayName: GetLeadResponseMock.data.lead.display_name,
          firstName: GetLeadResponseMock.data.lead.first_name,
          lastName: GetLeadResponseMock.data.lead.last_name,
        },
        events: expect.any(Array),
      })
    })
  })

  describe('When lead is not found', () => {
    beforeEach(() => {
      getLeadSpy = jest
        .spyOn(FreshsalesApiClient.prototype, 'getLead')
        .mockImplementationOnce(
          jest
            .fn()
            .mockRejectedValue(
              createAxiosError(404, 'Not Found', JSON.stringify({})),
            ),
        )
    })

    test('Should call onError', async () => {
      await sendCall.onEvent({
        payload: {
          fields: {
            leadId: '1',
          },
          settings: {
            domain: 'domain',
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: expect.arrayContaining([
          expect.objectContaining({
            text: {
              en: 'Lead not found (404)',
            },
          }),
        ]),
      })
    })
  })
})
