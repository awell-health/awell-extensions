import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { type Annotation } from '@medplum/fhirtypes'

export const addSideEffect: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addSideEffect',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add side effect',
  description: 'Add side effect to Medication Request',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: input,
      medplumSdk,
      activity,
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const annotation: Annotation = {
      text: input.sideEffect,
      authorReference: {
        identifier: {
          system: 'https://awellhealth.com/activities/',
          value: activity.id,
        },
        display: 'Awell',
      },
    }

    const currentMedicationRequest = await medplumSdk.readResource(
      'MedicationRequest',
      input.medicationRequestId
    )

    const currentAnnotations = currentMedicationRequest.note

    await medplumSdk.patchResource(
      'MedicationRequest',
      input.medicationRequestId,
      [
        {
          op: 'add',
          path: '/note',
          value: [...(currentAnnotations ?? []), annotation],
        },
      ]
    )

    await onComplete()
  },
}
