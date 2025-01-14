import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { get } from 'lodash'

export const getLastTaskPerformer: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getLastTaskPerformer',
  category: Category.COMMUNICATION,
  title: 'Get last task performer',
  description: 'Retrieves the performer of the last task.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { taskSdk, pathway } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    /**
     * Get the last task performed in the current care flow.
     */
    const { data } = await taskSdk.getTasks({
      status: 'completed',
      careflow_id: pathway.id, // We only want to get the last task performed in the current care flow.
      sort_by: 'completed_at',
      order_by: 'desc',
      limit: 1, // Given we sort by completed_at, we only need to get the last task so a limit of 1 is enough.
      offset: 0,
      activity_object_type: 'form', // only form tasks are completed in the worklist
    })

    const lastTask = data.tasks.length > 0 ? data.tasks[0] : null

    await onComplete({
      data_points: {
        stytchUserId: get(lastTask, 'performer.stytch_user_id') ?? undefined,
        email: get(lastTask, 'performer.email') ?? undefined,
      },
    })
  },
}
