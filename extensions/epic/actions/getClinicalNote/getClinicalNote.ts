import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdks } from '../../lib/validatePayloadAndCreateSdks'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell'
import { type BinaryReadResponseType } from '../../lib/api/FhirR4/schema'

export const getClinicalNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getClinicalNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get clinical note',
  description: 'Retrieve clinical note details from Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      epicFhirR4Sdk,
      fields: { resourceId },
    } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const res = await epicFhirR4Sdk.getDocumentReference(resourceId)
      const binaryContentHtml = res.data.content.find(content => content.attachment.contentType === 'text/html')
      const binaryContentRtf = res.data.content.find(content => content.attachment.contentType === 'text/rtf')

      const binaryIdHtml = binaryContentHtml?.attachment?.url?.split('/')[1]
      const binaryIdRtf = binaryContentRtf?.attachment?.url?.split('/')[1]

      const getBinary = async (binaryId?: string): Promise<BinaryReadResponseType | undefined> => {
        if (binaryId === undefined) {
          return undefined
        }
        const binaryRes = await epicFhirR4Sdk.getBinary(binaryId)
        return binaryRes.data
      }

      const binaryHtml = await getBinary(binaryIdHtml)
      const binaryRtf = await getBinary(binaryIdRtf)

      await onComplete({
        data_points: {
          documentReference: JSON.stringify(res.data),
          binaryContentHtml: binaryHtml !== undefined ? JSON.stringify(binaryHtml) : "Binary not found",
          binaryContentRtf: binaryRtf !== undefined ? JSON.stringify(binaryRtf) : "Binary not found",
        },
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Document reference not found',
              }),
            ],
          })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
