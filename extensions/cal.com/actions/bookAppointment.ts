import { FieldType, type Action, type Field } from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
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
  description: 'Enable a stakeholder to book an appointment via Cal.com.',
  category: Category.SCHEDULING,
  fields,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single'
    }
  },
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { calLink },
      settings,
    } = payload
    if (calLink === undefined) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Missing required fields (e.g. calLink)' },
          },
        ],
      })
    } else {
      try {
        console.log('bookAppointment -> onActivityCreated executed with: ', {
          fields: { calLink },
          settings,
        })
      } catch (error) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `Error in calDotCom extension -> bookAppointment action: ${JSON.stringify(
                  error
                )}`,
              },
            },
          ],
        })
      }
    }
  },
}
