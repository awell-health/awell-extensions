import { TestHelpers } from '@awell-health/extensions-core'
import { WestFaxApiClient } from '../../lib/api/client'
import { LandingAiApiClient } from '../../../landingAi/lib/api/client'
import { getFaxDocumentWithOCR as action } from './getFaxDocumentWithOCR'
import { getFaxDocumentMock } from '../getFaxDocument/__mocks__/GetFaxDocument.mock'
import { zOcrProvider } from './config/fields'

describe('WestFax - Get fax document with OCR', () => {
  let getFaxDocumentSpy: jest.SpyInstance
  let agenticDocumentAnalysisSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      getFaxDocumentSpy = jest
        .spyOn(WestFaxApiClient.prototype, 'getFaxDocument')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({ data: getFaxDocumentMock }),
        )

      agenticDocumentAnalysisSpy = jest
        .spyOn(LandingAiApiClient.prototype, 'agenticDocumentAnalysis')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({
            data: {
              data: {
                markdown: 'text',
                chunks: [],
                extracted_schema: {
                  dob: '2000-01-01',
                  urgency: 'Urgent',
                },
                extraction_metadata: null,
              },
              errors: [],
              extraction_error: null,
            },
          }),
        )
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            faxId: '1',
            ocrProvider: zOcrProvider.enum['awell-landing-ai'],
            ocrProviderApiKey: 'apiKey',
            fieldsSchema: JSON.stringify({
              type: 'object',
              title: 'Physician Referral Extraction Schema',
              $schema: 'http://json-schema.org/draft-07/schema#',
              required: ['date_of_birth', 'urgency', 'Referral reason'],
              properties: {
                date_of_birth: {
                  type: 'string',
                  format: 'YYYY-MM-DD',
                  description: 'Date of birth of the patient',
                },
                urgency: {
                  type: 'string',
                  description: 'Urgency of the referral',
                },
                'Referral reason': {
                  type: 'string',
                  description: 'Reason of the referral',
                },
              },
              description:
                "Schema for extracting high-value, form-like fields from a physician's referral markdown document.",
            }),
          },
          settings: {
            username: 'username',
            password: 'password',
            productId: 'productId',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          markdown: 'text',
          chunks: '[]',
          extractedDataBasedOnSchema: JSON.stringify({
            dob: '2000-01-01',
            urgency: 'Urgent',
          }),
          extractedMetadata: undefined,
          direction: getFaxDocumentMock.Result[0].Direction,
          date: getFaxDocumentMock.Result[0].Date,
          status: getFaxDocumentMock.Result[0].Status,
          format: getFaxDocumentMock.Result[0].Format,
          pageCount: String(getFaxDocumentMock.Result[0].PageCount),
        },
      })
    })
  })
})
