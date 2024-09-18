import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { getResponseText } from './lib/getResponseText'
import { summarizeFormWithLLM } from './lib/summarizeFormWithLLM'
import { DISCLAIMER_MSG } from '../../lib/constants'

// TODO get rid of console logs eventually
// TODO: Please check stakeholders aand whether I can get them lioke this - it is needed for the LLM call.
export const summarizeForm: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize form',
  description: 'Summarize the response of a form with AI.',
  fields,
  previewable: false,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { ChatModelGPT4o, fields: { additional_instructions }, pathway, activity } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { formDefinition, formResponse } = await getLatestFormInCurrentStep({
      awellSdk: await helpers.awellSdk(),
      pathwayId: pathway.id,
      activityId: activity.id,
    })

    const { result: responseText } = getResponseText({
      formDefinition,
      formResponse,
    })

    console.log(responseText)

    try {
      const summary = await summarizeFormWithLLM({
        ChatModelGPT4o,
        form_data: responseText,
        stakeholder: 'Clinician', // TODO please add actual stakeholder of the action !!!!!
        additional_instructions: additional_instructions ?? '',
      })

      console.log(`${DISCLAIMER_MSG}\n\n${summary}`)

      await onComplete({
        data_points: {
          summary: `${DISCLAIMER_MSG}\n\n${summary}`,
        },
      })
    } catch (error) {
      console.error('Error summarizing form:', error)
      throw new Error('Error summarizing form')
    }
  },
}