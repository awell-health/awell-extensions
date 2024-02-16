import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../helpers'

export const addProblemToPatientChart: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addProblemToPatientChart',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add problem to patient chart',
  description: "Records a problem in the patient's active problem list",
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
