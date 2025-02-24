import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { messageThreadSchema } from '../../validation/messageThread.zod'
import { isNil } from 'lodash'
import { dataPoints, fields, FieldsValidationSchema } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const createMessageThread: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createMessageThread',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Message Thread',
  description: "Create a message thread in Elation's messaging system.",
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      patientId,
      senderId,
      practiceId,
      documentDate,
      chartDate,
      messageBody,
      isUrgent,
      recipientId,
      groupId,
    } = FieldsValidationSchema.parse(payload.fields)

    const threadMembers = [
      // Individual recipient
      ...(!isNil(recipientId)
        ? [{ user: recipientId, status: 'Requiring Action' }]
        : []),
      // Group recipient
      ...(!isNil(groupId)
        ? [{ group: groupId, status: 'Requiring Action' }]
        : []),
      // Sender
      {
        user: senderId,
        status: 'Addressed',
      },
    ]

    const messageThread = messageThreadSchema.parse({
      patient: patientId,
      sender: senderId,
      practice: practiceId,
      document_date: documentDate,
      chart_date: chartDate,
      is_urgent: isUrgent,
      messages: [
        {
          body: messageBody,
          send_date: new Date().toISOString(),
          sender: senderId,
        },
      ],
      members: threadMembers,
    })

    const api = makeAPIClient(payload.settings)
    const data = await api.createMessageThread(messageThread)

    await onComplete({
      data_points: {
        messageThreadId: String(data.id),
      },
      /**
       * Temporary logging for debugging purposes
       * See https://awellhealth.slack.com/archives/C074XR57N0G/p1740425586512299
       */
      events: [
        addActivityEventLog({
          message: `Request\n${JSON.stringify(messageThread, null, 2)}`,
        }),
        addActivityEventLog({
          message: `Response\n${JSON.stringify(data, null, 2)}`,
        }),
      ],
    })
  },
}
