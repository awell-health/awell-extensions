import { type Field, FieldType, type Action } from '../../../lib/types'
import { type settings } from '../settings'
import { isNil } from 'lodash'

const fields = {
  low: {
    id: 'from_number',
    label: 'From',
    description:
      'The minimum number in the range (INCLUSIVE). Rounds up to nearest integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
  high: {
    id: 'to_number',
    label: 'To',
    description:
      'The maximum end of the range (INCLUSIVE). Rounds up to nearest integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const randomInteger: Action<typeof fields, typeof settings> = {
  key: 'random-integer',
  category: 'math',
  title: 'Random Integer',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields } = payload
    if (isNil(fields.low)) {
      await onError()
      return
    } else if (isNil(fields.high)) {
      await onError()
      return
    }
    let min = Math.ceil(+fields.low)
    let max = Math.ceil(+fields.high)
    if (isNaN(min) || isNaN(max)) {
      await onError()
      return
    }
    if (max < min) {
      // rather than explicitly error out here, I thought it would be an easier user experience to allow e.g. low=10 and high=1
      ;[min, max] = [max, min]
      return
    }
    const generatedNumber = Math.floor(Math.random() * (max - min + 1)) + min
    await onComplete({
      data_points: {
        generated_number: generatedNumber.toString(),
      },
    })
  },
}
