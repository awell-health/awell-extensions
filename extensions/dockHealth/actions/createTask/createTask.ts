import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { isEmpty } from 'lodash'

export const createTask: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createTask',
  category: Category.WORKFLOW,
  title: 'Create task',
  description: 'Create a Task in Dock Health',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, dockClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await dockClient.createTask({
      description: fields.description,
      patient: !isEmpty(fields.patientId)
        ? {
            id: fields.patientId as string,
          }
        : undefined,
      taskList: {
        id: fields.taskListId,
      },
      taskGroup: !isEmpty(fields.taskGroupId)
        ? {
            id: fields.taskGroupId as string,
          }
        : undefined,
      // taskMetaData: [
      //   {
      //     customFieldIdentifier: 'awellCareflowId',
      //     customFieldName: 'Awell care flow ID',
      //     value: pathwayId,
      //   },
      //   {
      //     customFieldIdentifier: 'awellActivityId',
      //     customFieldName: 'Awell activity ID',
      //     value: activityId,
      //   },
      // ],
    })

    await onComplete({
      data_points: {
        taskId: res.id,
      },
    })
  },
}
