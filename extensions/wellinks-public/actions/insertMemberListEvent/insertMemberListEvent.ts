import {
  type Action,
  type DataPointDefinition,
  Category,
  validate,
} from '@awell-health/extensions-core'
import { type settings } from '../../config/settings'
import { WellinksClient } from '../../api/clients/wellinksClient'
import {
  fields,
  FieldsValidationSchema,
  InsertMemberListEventSettingsSchema,
} from './config'
import { z } from 'zod'
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
    const {
      fields: {
        eventName,
        memberId,
        sourceName,
        sendgridListId,
        originatorName,
        eventDate,
        lockedById,
      },
      settings: { platformApiUrl, platformApiKey },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: InsertMemberListEventSettingsSchema,
      }),
      payload,
    })

    try {
      const client = new WellinksClient(platformApiUrl, platformApiKey)

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
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'an error occurred while trying to insert a MemberListEvent',
            },
            error: {
              category: 'SERVER_ERROR',
              message: `Message: ${error.message}`,
            },
          },
        ],
      })
    }
  },
}
