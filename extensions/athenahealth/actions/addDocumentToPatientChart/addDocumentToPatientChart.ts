import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'

export const addDocumentToPatientChart: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addDocumentToPatientChart',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add document to patient chart',
  description: "Adds a document to the patient's chart",
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields: input, client } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    console.log(input, client)

    await onComplete()
  },
}
