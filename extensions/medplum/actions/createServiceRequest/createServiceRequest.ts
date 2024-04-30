import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'

export const createServiceRequest: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createServiceRequest',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create service request',
  description: 'Create a service request in Medplum',
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

    const res = await medplumSdk.createResource({
      resourceType: 'ServiceRequest',
      status: input.status,
      intent: input.intent,
      priority: input.priority,
      subject: {
        reference: `Patient/${input.patientId}`,
      },
      requester: {
        identifier: {
          system: 'https://awellhealth.com/activities/',
          value: activity.id,
        },
        display: 'Awell',
      },
    })

    await onComplete({
      data_points: {
        // @ts-expect-error id is not included in the response type?
        serviceRequestId: res.id,
      },
    })
  },
}
