import {
  type Field,
  FieldType,
  type Action,
  type NewActivityPayload,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'

const fields = {
  min: {
    id: 'min',
    label: 'Minimum number',
    description:
      'The minimum number in the range (INCLUSIVE). Rounds up to nearest integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
  max: {
    id: 'max',
    label: 'Maximum number',
    description:
      'The maximum end of the range (INCLUSIVE). Rounds up to nearest integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const randomNumber: Action<typeof fields, typeof settings> = {
  key: 'randomNumber',
  title: 'Generate random number',
  description: 'Generate a random (whole) number between a given range.',
  category: Category.MATH,
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields } = payload

    const minNum = Math.ceil(Number(fields.min))
    const maxNum = Math.ceil(Number(fields.max))

    if (isNaN(minNum)) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Min is not defined.' },
          },
        ],
      })
      return
    } else if (isNaN(maxNum)) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Max is not defined.' },
          },
        ],
      })
      return
    }

    const [min, max] = [maxNum, minNum].sort((a, b) => a - b)

    const generatedNumber = Math.floor(Math.random() * (max - min + 1)) + min

    await onComplete({
      data_points: {
        // This should really be a number
        randomNumber: generatedNumber.toString(),
      },
    })
  },
}
export type RandomNumberActivityPayload = NewActivityPayload<
  keyof typeof settings,
  keyof typeof fields
>
