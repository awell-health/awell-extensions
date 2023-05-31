import {
  type DataPointDefinition,
  FieldType,
  type Action,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'

const fields = {
  calLink: {
    id: 'calLink',
    label: 'Cal Link',
    description:
      'The Cal Link that you want to embed e.g. "john". Just give the username. No need to give the full URL https://cal.com/john.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  bookingId: {
    key: 'bookingId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const bookAppointment: Action<typeof fields, typeof settings> = {
  key: 'bookAppointment',
  title: 'Book appointment',
  description: 'Enable a stakeholder to book an appointment via Cal.com.',
  category: Category.SCHEDULING,
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { calLink },
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
    }
  },
}
