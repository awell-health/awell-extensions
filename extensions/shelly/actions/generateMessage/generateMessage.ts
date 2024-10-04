import { Category, type Action } from '@awell-health/extensions-core'
import { generateMessageWithLLM } from './lib/generateMessageWithLLM'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'

export const generateMessage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'generateMessage',
  category: Category.WORKFLOW,
  title: 'Generate Message',
  description:
    'Generate a personalized message',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      ChatModelGPT4o,
      fields: { communicationObjective, personalizationInput, stakeholder, language },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const generated_message = await generateMessageWithLLM({
        ChatModelGPT4o,
        communicationObjective,
        personalizationInput,
        stakeholder,
        language,
      })

      const { subject, message } = generated_message
      console.log(subject)
      console.log(message)

      const htmlMessage = await markdownToHtml(message)

      await onComplete({
        data_points: {
          subject,
          message: htmlMessage,
        },
      })
    } catch (error) {
      console.error('Error generating message:', error)
      // Catch in extention server
      throw new Error('Error generating message')
    }
  },
}
