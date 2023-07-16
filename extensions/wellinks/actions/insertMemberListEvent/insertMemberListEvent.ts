import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { WellinksClient } from '../../wellinksClient'
import { isNil } from 'lodash'

const fields = {
  eventName: {
    id: 'eventName',
    label: 'Event Name',
    description:
      'The member list event name (Marked Ineligble, Enrolled, Unenrolled, etc)',
    type: FieldType.STRING,
    required: true,
  },
  memberId: {
    id: 'memberId',
    label: 'Member ID',
    description: 'The Wellinks ID of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  sourceName: {
    id: 'sourceName',
    label: 'Source',
    description:
      'The source of the Member List Event (Sendgrid, Member Medical History CCA, Member Event Form, etc)',
    type: FieldType.STRING,
    required: true,
  },
  sendgridListId: {
    id: 'sendgridListID',
    label: 'Sendgrid List ID',
    description: 'The ID of the Sendgrid list.',
    type: FieldType.STRING,
    required: true,
  },
  originatorName: {
    id: 'originatorName',
    label: 'Originator',
    description: 'The originator of the event (Memeber, Coach, etc)',
    type: FieldType.STRING,
    required: true,
  },
  eventDate: {
    id: 'eventDate',
    label: 'Event Date',
    description: 'The Date/Time of the Member List Event',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  insertSuccessful: {
    key: 'insertSuccessful',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const insertMemberListEvent: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'insertMemberListEvent',
  category: Category.SCHEDULING,
  title: 'Insert Member List Event',
  description: 'Inserts a MembersListEvent record in the Hubble Database',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const {
      eventName,
      memberId,
      sourceName,
      sendgridListId,
      originatorName,
      eventDate,
    } = fields

    try {
      if (isNil(settings.platformApiUrl) || isNil(settings.platformApiKey)) {
        throw new Error(
          'The Platform API URL and/or API Key is not set in the settings'
        )
      }
      const client = new WellinksClient(
        settings.platformApiUrl,
        settings.platformApiKey
      )
      if (!isNil(client)) {
        if (
          isNil(eventName) ||
          isNil(memberId) ||
          isNil(sourceName) ||
          isNil(sendgridListId) ||
          isNil(originatorName) ||
          isNil(eventDate)
        ) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'Some or all of the arguments are missing.',
                },
                error: {
                  category: 'SERVER_ERROR',
                  message: 'Some or all of the arguments are missing.',
                },
              },
            ],
          })
          return
        }
        const response = await client.memberListEvent.insert(
          eventName,
          memberId,
          sourceName,
          sendgridListId,
          originatorName,
          eventDate
        )
        if (response === 201) {
          await onComplete({
            data_points: {
              insertSuccessful: 'true',
            },
          })
        } else {
          await onComplete({
            data_points: {
              insertSuccessful: 'false',
            },
          })
        }
      }
    } catch {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'an error occurred while trying to insert a MemberListEvent',
            },
            error: {
              category: 'SERVER_ERROR',
              message:
                'an error occurred while trying to insert a MemberListEvent',
            },
          },
        ],
      })
    }
  },
}
