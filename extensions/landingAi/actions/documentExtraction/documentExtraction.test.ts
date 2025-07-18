import { TestHelpers } from '@awell-health/extensions-core'
import { LandingAiApiClient } from '../../lib/api/client'
import { documentExtraction as action } from './documentExtraction'

describe('Landing.ai - Document Extraction', () => {
  let agenticDocumentAnalysisSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
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
            fileType: 'image',
            fileUrl:
              'https://res.cloudinary.com/da7x4rzl4/image/upload/v1752835405/Awell%20Extensions/awellimage.png',
            fieldsSchema: undefined,
          },
          settings: {
            apiKey: 'apiKey',
          },
        } as any,
        onComplete,
        onError,
        helpers,
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
        },
      })
    })
  })
})
