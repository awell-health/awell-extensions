import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { dataPoints, fields } from './config'
import { addActivityEventLog } from '../../../../../src/lib/awell'
// import { z } from 'zod'

export const listToCommaSeparatedText: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listToCommaSeparatedText',
  title: 'List to comma separated text',
  description:
    'Transform or parse list (string array) to a comma separated text.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete) => {
    await onComplete({
      events: [
        addActivityEventLog({
          message: JSON.stringify(payload.fields, null, 2),
        }),
      ],
      data_points: {
        listText: 'todo',
      },
    })

    // const {
    //   fields: { list },
    // } = validate({
    //   schema: z.object({
    //     fields: FieldsValidationSchema,
    //   }),
    //   payload,
    // })

    // const output = list.join(',')
    // await onComplete({
    //   data_points: {
    //     listText: output,
    //   },
    // })
  },
}
