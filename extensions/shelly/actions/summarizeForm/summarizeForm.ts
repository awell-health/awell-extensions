import { Category, type Action } from '@awell-health/extensions-core'
import { summarizeFormWithLLM } from '../../lib/summarizeFormWithLLM'
import { detectLanguageWithLLM } from '../../lib/detectLanguageWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import {
  getFormResponseText,
  getResponsesForAllForms,
} from '../../lib/getFormResponseText'
import {
  getLatestFormInCurrentStep,
  getAllFormsInCurrentStep,
  getFormsInTrack,
} from '../../../../src/lib/awell'
import { markdownToHtml } from '../../../../src/utils'
import { getCareFlowDetails } from '../../lib/getCareFlowDetails'
import { isNil } from 'lodash'

/**
 * Awell Action: Form Summarization
 *
 * Takes form responses and preferences as input, uses LLM to:
 * 1. Generate a concise summary in specified format and language
 * 2. Includes appropriate disclaimer
 *
 * Supports configurable scope (Step or Track) and form selection (Latest or All),
 * matching the behavior of the listFormAnswers action.
 *
 * @returns HTML-formatted summary
 */
export const summarizeForm: Action<
  typeof fields,
  Record<string, never>,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize Form',
  description:
    'Summarize form responses with AI. Defaults to the latest form in the current step, but can summarize all forms in the step or across the track.',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const {
      scope,
      formSelection,
      summaryFormat,
      language,
      additionalInstructions,
    } = FieldsValidationSchema.parse(payload.fields)

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
      hideDataForTracing: true, // Hide input and output data when tracing
    })

    const awellSdk = await helpers.awellSdk()

    // Get care flow details for the disclaimer
    const careFlowDetails = await getCareFlowDetails(
      awellSdk,
      payload.pathway.id,
    )

    // 3. Get form data based on scope and formSelection
    let formData: string

    if (scope === 'Step') {
      if (formSelection === 'Latest') {
        // Single latest form in step (original behavior)
        const { formDefinition, formResponse } =
          await getLatestFormInCurrentStep({
            awellSdk,
            pathwayId: payload.pathway.id,
            activityId: payload.activity.id,
          })

        const { result } = getFormResponseText({
          formDefinition,
          formResponse,
        })
        formData = result
      } else {
        // All forms in step
        const formsData = await getAllFormsInCurrentStep({
          awellSdk,
          pathwayId: payload.pathway.id,
          activityId: payload.activity.id,
        })

        const { result } = getResponsesForAllForms({ formsData })
        formData = result
      }
    } else {
      // scope === 'Track'
      const allFormsInTrack = await getFormsInTrack({
        awellSdk,
        pathwayId: payload.pathway.id,
        activityId: payload.activity.id,
      })

      if (formSelection === 'Latest') {
        // Latest form in track
        if (allFormsInTrack.length === 0) {
          formData = ''
        } else {
          const latestForm = allFormsInTrack[allFormsInTrack.length - 1]
          const { result } = getFormResponseText({
            formDefinition: latestForm.formDefinition,
            formResponse: latestForm.formResponse,
          })
          formData = result
        }
      } else {
        // All forms in track
        const { result } = getResponsesForAllForms({
          formsData: allFormsInTrack,
        })
        formData = result
      }
    }

    if (formData === '') {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `No completed form found in the current ${scope.toLowerCase()}`,
            },
            error: {
              category: 'WRONG_INPUT',
              message: `No completed form found in the current ${scope.toLowerCase()}`,
            },
          },
        ],
      })
      return
    }

    // Create disclaimer message based on version availability
    let disclaimerMessage = ''
    if (!isNil(careFlowDetails.version)) {
      disclaimerMessage = `**Important Notice:** The content provided is an AI-generated summary of form responses of version ${careFlowDetails.version} of Care Flow "${careFlowDetails.title}" (ID: ${payload.pathway.id}).`
    } else {
      disclaimerMessage = `**Important Notice:** The content provided is an AI-generated summary of form responses of Care Flow "${careFlowDetails.title}" (ID: ${payload.pathway.id}).`
    }

    let summaryLanguage = language

    if (language === 'Default') {
      try {
        summaryLanguage = await detectLanguageWithLLM({
          model,
          text: formData,
          metadata,
          callbacks,
        })
      } catch (error) {
        // If language detection fails, keep using 'Default'
        summaryLanguage = 'Default'
      }
    }

    // 4. Generate summary
    const summary = await summarizeFormWithLLM({
      model,
      formData,
      summaryFormat,
      language: summaryLanguage,
      disclaimerMessage,
      additionalInstructions,
      metadata,
      callbacks,
    })

    // 5. Format and return results
    const htmlSummary = await markdownToHtml(summary)
    await onComplete({
      data_points: {
        summary: htmlSummary,
      },
    })
  },
}
