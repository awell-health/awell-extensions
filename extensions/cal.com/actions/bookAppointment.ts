import { FieldType, type Action, type Field } from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  calLink: {
    id: 'calLink',
    label: 'Cal Link',
    type: FieldType.STRING,
    required: true,
  },
  // TODO: Implement BOOLEAN field type for `Show event type details`
  // showEventTypeDetails: {
  //   id: 'showEventTypeDetails',
  //   label: 'Show event type details',
  //   type: FieldType.BOOLEAN,
  //   required: false,
  // },
} satisfies Record<string, Field>

export const bookAppointment: Action<typeof fields, typeof settings> = {
  key: 'bookAppointment',
  title: 'Book appointment',
  category: 'Scheduling',
  fields,
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { calLink },
    } = payload
    if (calLink === undefined) {
      console.error('calLink is not defined')
    } else {
      try {
        console.log('bookAppointment -> onActivityCreated executed with: ', {calLink})
      } catch (err) {
        console.error('Error in calDotCom extension -> bookAppointment action', err)
      }
    }
    await onComplete()
  },
}
