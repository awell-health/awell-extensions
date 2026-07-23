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
    'Get fax document with SRFax and extract structured data with OCR',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing getFaxDocumentWithOCR',
    )

    const { fields, srfaxSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const activityEventLog: ActivityEvent[] = []

    const retrieve = await srfaxSdk.retrieveFax({
      faxDetailsId: fields.faxId,
      direction: 'IN',
    })

    if (
      retrieve.status !== 'Success' ||
      retrieve.result === null ||
      retrieve.result === undefined ||
      retrieve.result === ''
    ) {
      await onError({
        events: [
          addActivityEventLog({
            message: `Error getting fax document:\n${JSON.stringify(retrieve.raw, null, 2)}`,
          }),
        ],
      })
      return
    }

    const direction: string | undefined = 'IN'
    let date: string | undefined
    let pageCount: string | undefined
    let status: string | undefined
    const format: string | undefined = 'PDF'

    try {
      const inbox = await srfaxSdk.getFaxInboxAll()
      if (inbox.status === 'Success' && Array.isArray(inbox.result)) {
        const match = inbox.result.find((i: unknown) => {
          if (typeof i !== 'object' || i === null) {
            return false
          }

          const item = i as { FileName?: unknown }
          if (
            typeof item.FileName === 'string' &&
            item.FileName.includes('|')
          ) {
            const id = item.FileName.split('|')[1]
            return id === fields.faxId
          }
          return false
        })
        if (match !== undefined) {
          const matchedFax = match as {
            Date?: unknown
            Pages?: unknown
            ReceiveStatus?: unknown
          }
          date =
            typeof matchedFax.Date === 'string' ? matchedFax.Date : undefined
          pageCount =
            matchedFax.Pages !== null && matchedFax.Pages !== undefined
              ? String(matchedFax.Pages)
              : undefined
          status =
            typeof matchedFax.ReceiveStatus === 'string'
              ? matchedFax.ReceiveStatus
              : undefined
        }
      }
    } catch (_e) {}

    if (retrieve.result.length === 0) {
      activityEventLog.push(
        addActivityEventLog({
          message: 'No fax file was found',
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
          pdf: retrieve.result,
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
        direction,
        date,
        status,
        format,
        pageCount,
      },
    })
  },
}
