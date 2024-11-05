import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { messageThreadSchema } from '../validation/messageThread.zod'

export const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient associated with this message thread',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    description: 'The practice associated with this message thread',
    type: FieldType.NUMERIC,
    required: true,
  },
  isUrgent: {
    id: 'isUrgent',
    label: 'Urgent',
    description: 'Marks the message thread as urgent if true',
    type: FieldType.BOOLEAN,
    required: false,
  },
  messageBody: {
    id: 'messageBody',
    label: 'Message Body',
    description: 'The content of the initial message in the thread',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  messageThreadId: {
    key: 'messageThreadId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, practiceId, isUrgent, messageBody } = payload.fields

      const messageThread = messageThreadSchema.parse({
        patient: patientId,
        practice: practiceId,
        is_urgent: isUrgent,
        messages: [{ body: messageBody }],
      })

      const api = makeAPIClient(payload.settings)
      const { id } = await api.createMessageThread(messageThread)

      await onComplete({
        data_points: {
          messageThreadId: String(id),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'BAD_REQUEST',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
