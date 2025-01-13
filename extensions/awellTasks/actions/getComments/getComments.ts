import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { htmlToEscapedJsString } from './lib/htmlToEscapedJsString'

export const getComments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getComments',
  category: Category.COMMUNICATION,
  title: 'Get comments',
  description: 'Retrieves all comments in a care flow.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { taskSdk, pathway } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await taskSdk.getCareflowComments({
      careflowId: pathway.id,
      /**
       * This endpoint is paginated.
       * We currently use a heuristic and assume that 50 is a good number to retrieve all comments.
       */
      limit: 50,
      offset: 0,
    })

    const commentsAsText = data.comments
      .map((comment) => {
        const author = `Author: ${comment.comment?.created_by?.email ?? 'Unknown user'}`
        const date = `Date: ${new Date(
          comment.comment?.created_at ?? '',
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`
        // Non-visit note text only supports plain text.
        const commentText = htmlToEscapedJsString(comment.comment?.text ?? '')
        return `${author}\n${date}\n\n${commentText}\n\n-------------------\n`
      })
      .join('\n')

    await onComplete({
      data_points: {
        comments:
          commentsAsText.length > 0 ? commentsAsText : 'No comments found',
      },
    })
  },
}
