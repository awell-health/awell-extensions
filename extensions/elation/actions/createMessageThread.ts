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
import { messageThreadSchema } from '../validation/messageThread.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient chart for which the thread is about',
    type: FieldType.NUMERIC,
    required: true,
  },
  senderId: {
    id: 'senderId',
    label: 'Sender ID',
    description: 'The ID of the user initiating the message thread',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice ID',
    description: 'The practice associated with the patient chart',
    type: FieldType.NUMERIC,
    required: true,
  },
  documentDate: {
    id: 'documentDate',
    label: 'Document Date',
    description: 'Date associated with the document (ISO format)',
    type: FieldType.DATE,
    required: true,
  },
  chartDate: {
    id: 'chartDate',
    label: 'Chart Date',
    description: 'Date of the patient’s chart (ISO format)',
    type: FieldType.DATE,
    required: true,
  },
  messageBody: {
    id: 'messageBody',
    label: 'Message Body',
    description: 'The content of the initial message in the thread',
    type: FieldType.STRING,
    required: true,
  },
  isUrgent: {
    id: 'isUrgent',
    label: 'Urgent',
    description: 'Marks the message thread as urgent if true',
    type: FieldType.BOOLEAN,
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
      const {
        patientId,
        senderId,
        practiceId,
        documentDate,
        chartDate,
        messageBody,
        isUrgent,
      } = payload.fields

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
