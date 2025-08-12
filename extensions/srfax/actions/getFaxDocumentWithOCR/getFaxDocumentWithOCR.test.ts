import { TestHelpers } from '@awell-health/extensions-core'
import { SrfaxApiClient } from '../../lib/api/client'
import { LandingAiApiClient } from '../../../landingAi/lib/api/client'
import { getFaxDocumentWithOCR as action } from './getFaxDocumentWithOCR'
import { zOcrProvider } from './config/fields'

describe('SRFax - Get fax document with OCR', () => {
  let retrieveFaxSpy: jest.SpyInstance
  let getFaxInboxAllSpy: jest.SpyInstance
  let agenticDocumentAnalysisSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      retrieveFaxSpy = jest
        .spyOn(SrfaxApiClient.prototype, 'retrieveFax')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({
            status: 'Success',
            result: 'JVBERi0xLjQK', // base64-encoded minimal PDF header
            raw: { Status: 'Success' },
          }),
        )

      getFaxInboxAllSpy = jest
        .spyOn(SrfaxApiClient.prototype, 'getFaxInboxAll')
        .mockImplementationOnce(
          jest.fn().mockResolvedValue({
            status: 'Success',
            result: [
              {
                FileName: '20250806090200-407625-49420|1516273800',
                ReceiveStatus: 'Ok',
                Date: 'Aug 06, 2025 12:02 PM',
                EpochTime: 1754496120,
                Pages: '2',
                ViewedStatus: 'Y',
              },
            ],
            raw: { Status: 'Success' },
          }),
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
            faxId: '1516273800',
            ocrProvider: zOcrProvider.enum['awell-landing-ai'],
            ocrProviderApiKey: 'apiKey',
            fieldsSchema: JSON.stringify({
              type: 'object',
              title: 'Extraction Schema',
              $schema: 'http://json-schema.org/draft-07/schema#',
              required: ['date_of_birth', 'urgency'],
              properties: {
                date_of_birth: { type: 'string' },
                urgency: { type: 'string' },
              },
            }),
          },
          settings: {
            accountId: '407625',
            password: 'secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(retrieveFaxSpy).toHaveBeenCalled()
      expect(agenticDocumentAnalysisSpy).toHaveBeenCalled()

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          markdown: 'text',
          chunks: '[]',
          extractedDataBasedOnSchema: JSON.stringify({
            dob: '2000-01-01',
            urgency: 'Urgent',
          }),
          extractedMetadata: undefined,
          direction: 'IN',
          date: 'Aug 06, 2025 12:02 PM',
          status: 'Ok',
          format: 'PDF',
          pageCount: '2',
        },
      })
    })
  })
})
