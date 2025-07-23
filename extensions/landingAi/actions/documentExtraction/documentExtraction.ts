import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const documentExtraction: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'documentExtraction',
  category: Category.DOCUMENT_MANAGEMENT,
  title: 'Document extraction',
  description: 'Extract structured data from documents and images',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, landingAiSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await landingAiSdk.agenticDocumentAnalysis({
      input: {
        body: {
          image: fields.fileType === 'image' ? fields.fileUrl : null,
          pdf: fields.fileType === 'pdf' ? fields.fileUrl : null,
          include_marginalia: true,
          include_metadata_in_markdown: true,
          fields_schema: !isNil(fields.fieldsSchema)
            ? JSON.stringify(fields.fieldsSchema)
            : null,
        },
      },
      mode: 'remoteFile',
    })

    if (data.errors.length > 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: JSON.stringify(data.errors, null, 2),
          }),
        ],
      })
      return
    }

    if (data.extraction_error !== null) {
      await onError({
        events: [
          addActivityEventLog({
            message: data.extraction_error,
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
      },
    })
  },
}
