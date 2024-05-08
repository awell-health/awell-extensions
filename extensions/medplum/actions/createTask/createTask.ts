import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const createTask: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createTask',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create task',
  description: 'Create a Task in Medplum',
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
      resourceType: 'Task',
      code: {
        text: input.taskTitle,
      },
      description: input.description,
      status: input.status,
      intent: input.intent,
      priority: input.priority,
      for: {
        reference: `Patient/${
          extractResourceId(input.patientId, 'Patient') ?? 'undefined'
        }`,
      },
      executionPeriod: {
        end: input.dueDate,
      },
      performerType: [
        {
          text: input.performerType,
        },
      ],
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
        taskId: res.id,
      },
    })
  },
}
