import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const summarizeCareFlow: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeCareFlow',
  category: Category.WORKFLOW,
  title: 'Summarize care flow',
  description: 'Summarize the care flow up until now',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { pathway } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const awellSdk = await helpers.awellSdk()

    /**
     * Limitation: this query is paginated so we might not get all pathway activities
     */
    const pathwayActivitesUntilNow = await awellSdk.orchestration.query({
      pathwayActivities: {
        __args: {
          pathway_id: pathway.id,
          pagination: { offset: 0, count: 500 },
          sorting: {
            direction: 'desc',
            field: 'date',
          },
        },
        activities: {
          __scalar: true,
          subject: {
            __scalar: true,
          },
          object: {
            __scalar: true,
          },
          indirect_object: {
            __scalar: true,
          },
          context: {
            __scalar: true,
          },
          track: {
            __scalar: true,
          },
          sub_activities: {
            __scalar: true,
          },
        },
      },
    })

    console.log(
      JSON.stringify(
        pathwayActivitesUntilNow.pathwayActivities.activities,
        null,
        2
      )
    )

    // Call OpenAI
    // const res = await langChainOpenAiSdk.invoke()

    await onComplete({
      data_points: {
        summary: 'Hello world',
      },
    })
  },
}
