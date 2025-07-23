import { type Action, type ActivityEvent } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields } from './config'
import { dataPoints } from './config/dataPoints'
import { FieldsValidationSchema } from './config/fields'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { baseUrl as landingAiBaseUrl } from '../../../landingAi/lib/validatePayloadAndCreateSdk'
import { LandingAiApiClient } from '../../../landingAi/lib/api/client'
import { isNil } from 'lodash'

export const getFaxDocumentWithOCR: Action<typeof fields, typeof settings> = {
  key: 'getFaxDocumentWithOCR',
  category: Category.DOCUMENT_MANAGEMENT,
  title: 'Get fax document with OCR',
  description:
    'Get fax document with WestFax and extract structured data with OCR',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, westFaxSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const activityEventLog: ActivityEvent[] = []

    const response = await westFaxSdk.getFaxDocument({
      Cookies: false,
      FaxIds1: {
        Id: fields.faxId,
      },
      format: 'pdf',
    })

    if (!response.data.Success) {
      await onError({
        events: [
          addActivityEventLog({
            message: `Error getting fax document:\n${JSON.stringify(
              response.data,
              null,
              2,
            )}`,
          }),
        ],
      })
      return
    }

    if (response.data.Result.length === 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'No fax document found',
          }),
        ],
      })
      return
    }

    if (response.data.Result.length > 1) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'More than one fax document found',
          }),
        ],
      })
      return
    }

    const faxDocument = response.data.Result[0]

    if (faxDocument.FaxFiles[0].FileContents.length === 0) {
      activityEventLog.push(
        addActivityEventLog({
          message: 'No fax file was found',
        }),
      )
    }

    if (faxDocument.FaxFiles[0].FileContents.length > 1) {
      activityEventLog.push(
        addActivityEventLog({
          message: 'More than 1 fax file was found, only storing the first one',
        }),
      )
    }

    const landingAiSdk = new LandingAiApiClient({
      baseUrl: landingAiBaseUrl,
      apiKey: fields.ocrProviderApiKey,
    })

    const { data } = await landingAiSdk.agenticDocumentAnalysis({
      input: {
        body: {
          image: null,
          pdf: faxDocument.FaxFiles[0].FileContents, // Base64 encoded pdf file
          include_marginalia: true,
          include_metadata_in_markdown: true,
          fields_schema: !isNil(fields.fieldsSchema)
            ? JSON.stringify(fields.fieldsSchema)
            : null,
        },
      },
      mode: 'base64EncodedFile',
    })

    if (data.errors.length > 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: `OCR Error:\n${JSON.stringify(data.errors, null, 2)}`,
          }),
        ],
      })
      return
    }

    if (data.extraction_error !== null) {
      await onError({
        events: [
          addActivityEventLog({
            message: `OCR Error:\n${data.extraction_error}`,
          }),
        ],
      })
      return
    }

    await onComplete({
      data_points: {
        markdown: data.data.markdown,
        chunks: JSON.stringify(data.data.chunks),
        extractedDataBasedOnSchema: !isNil(data.data.extracted_schema)
          ? JSON.stringify(data.data.extracted_schema)
          : undefined,
        extractedMetadata: !isNil(data.data.extraction_metadata)
          ? JSON.stringify(data.data.extraction_metadata)
          : undefined,
        direction: faxDocument.Direction,
        date: faxDocument.Date,
        status: faxDocument.Status,
        format: faxDocument.Format,
        pageCount: String(faxDocument.PageCount),
      },
    })
  },
}
