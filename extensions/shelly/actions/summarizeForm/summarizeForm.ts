// import { AwellSdk } from '@awell-health/awell-sdk'
import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '@extensions/shelly/lib'
import { getLatestFormInStep } from '@extensions/shelly/lib/utils/getLatestFormInStep'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getResponseText } from './lib/getResponseText'

export const summarizeForm: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize form',
  description: 'Summarize the response of a form',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { pathway, activity } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    // const awellSdk = new AwellSdk({
    //   environment: 'development',
    //   apiKey: '',
    // })

    const { formDefinition, formResponse } = await getLatestFormInStep({
      awellSdk: await helpers.awellSdk(),
      // awellSdk,
      pathwayId: pathway.id,
      activityId: activity.id,
    })

    const { result: responseText } = getResponseText({
      formDefinition,
      formResponse,
    })

    console.log(responseText)

    await onComplete({
      data_points: {
        summary: responseText,
      },
    })

    // const openAiSdk = openai

    // const completion = await openAiSdk.chat.completions.create({
    //   messages: [
    //     // Prompt, context
    //     {
    //       role: 'system',
    //       content:
    //         'You will be provided with a questionnaire response, and your task is to summarize the meeting as follows:\n\n- Overall summary of the response',
    //     },
    //     // Form answers
    //     { role: 'user', content: 'Who won the world series in 2020?' },
    //   ],
    //   model: 'gpt-3.5-turbo',
    // })

    // const result = completion.choices[0].message.content

    // await onComplete({
    //   data_points: {
    //     summary: JSON.stringify(result),
    //   },
    // })
  },
}
