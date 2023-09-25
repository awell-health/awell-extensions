import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
  type OnErrorCallback,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../config/settings'
import { WellinksClient } from '../../api/clients/wellinksClient'
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
    id: 'sendgridListId',
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
    type: FieldType.DATE,
    required: true,
  },
  lockedById: {
    id: 'lockedById',
    label: 'Locked By ID',
    description:
      'The ID of the coach that signed and locked the healthie form.',
    type: FieldType.STRING,
    required: false,
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
      lockedById,
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

      if (isNil(eventName)) {
        await buildValidationError('eventName', onError)
        return
      }
      if (isNil(memberId)) {
        await buildValidationError('memberId', onError)
        return
      }
      if (isNil(sourceName)) {
        await buildValidationError('sourceName', onError)
        return
      }
      if (isNil(sendgridListId)) {
        await buildValidationError('sendgridListId', onError)
        return
      }
      if (isNil(originatorName)) {
        await buildValidationError('originatorName', onError)
        return
      }
      if (isNil(eventDate)) {
        await buildValidationError('eventDate', onError)
        return
      }

      const response = await client.memberListEvent.insert({
        eventName,
        memberId,
        sourceName,
        sendgridListId,
        originatorName,
        eventDate,
        lockedById,
      })
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

async function buildValidationError(
  field: string,
  onError: OnErrorCallback
): Promise<void> {
  await onError({
    events: [
      {
        date: new Date().toISOString(),
        text: {
          en: `The ${field} field is required`,
        },
        error: {
          category: 'SERVER_ERROR',
          message: `The ${field} field is required`,
        },
      },
    ],
  })
}
