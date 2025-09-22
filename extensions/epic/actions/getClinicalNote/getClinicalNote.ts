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
      const binaryContent = res.data.content[1]
      const binaryId = binaryContent?.attachment?.url?.split('/')[1]

      const getBinary = async (binaryId?: string): Promise<BinaryReadResponseType | undefined> => {
        if (binaryId === undefined) {
          return undefined
        }

        const binaryRes = await epicFhirR4Sdk.getBinary(binaryId)
        return binaryRes.data
      }

      const binary = await getBinary(binaryId)

      await onComplete({
        data_points: {
          documentReference: JSON.stringify(res.data),
          binary: binary !== undefined ? JSON.stringify(binary) : "Binary not found",
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
