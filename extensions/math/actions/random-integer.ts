import { type Field, FieldType, type Action } from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  low: {
    id: 'low',
    label: 'Low number',
    description:
      'The minimum number in the range (INCLUSIVE). Rounds up to nearest integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
  high: {
    id: 'high',
    label: 'High number',
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
    const lowNum = Math.ceil(Number(fields.low))
    const highNum = Math.ceil(Number(fields.high))
    if (isNaN(lowNum)) {
      await onError()
      return
    } else if (isNaN(highNum)) {
      await onError()
      return
    }
    const [min, max] = [highNum, lowNum].sort((a, b) => a - b)
    const generatedNumber = Math.floor(Math.random() * (max - min + 1)) + min
    await onComplete({
      data_points: {
        generated_number: generatedNumber.toString(),
      },
    })
  },
}
