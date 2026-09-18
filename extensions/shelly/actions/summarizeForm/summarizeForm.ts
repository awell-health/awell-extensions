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
  getFormsInStep,
  getFormsInTrack,
  resolveStepId,
} from '../../../../src/lib/awell'
import { markdownToHtml } from '../../../../src/utils'
import { getCareFlowDetails } from '../../lib/getCareFlowDetails'
import { isNil } from 'lodash'
import { SettingsValidationSchema, type settings } from '../../settings'
import { resolveDisclaimerConfig } from '../../lib/disclaimer'

/**
 * Awell Action: Form Summarization
 *
 * Takes form responses and preferences as input, uses LLM to:
 * 1. Generate a concise summary in specified format and language
 * 2. Includes appropriate disclaimer
 *
 * Supports configurable scope (Step or Track) and form selection (Latest or All),
 * matching the behavior of the listFormAnswers action. An optional step ID lets
 * the action read forms from another step (e.g. in another track) of the care flow.
 *
 * @returns HTML-formatted summary
 */
export const summarizeForm: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'summarizeForm',
  category: Category.WORKFLOW,
  title: 'Summarize Form',
  description:
    'Summarize form responses with AI. Defaults to the latest form in the current step, but can summarize all forms in the step, across the track, or in a specific step (by ID).',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input fields
    const {
      scope,
      stepId,
      formSelection,
      summaryFormat,
      language,
      additionalInstructions,
      disclaimerText,
      disclaimerPlacement,
    } = FieldsValidationSchema.parse(payload.fields)
    const {
      disclaimerText: tenantDisclaimerText,
      disclaimerPlacement: tenantDisclaimerPlacement,
    } = SettingsValidationSchema.parse(payload.settings ?? {})

    // 2. Initialize OpenAI model with metadata
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT5Mini,
      hideDataForTracing: true, // Hide input and output data when tracing
      // Summarizing a form is a low-complexity task, so we cap reasoning effort
      // to keep gpt-5-mini latency well under the request timeout. Scoped to this
      // action so other extensions keep the model's default reasoning quality.
      modelConfigOverrides: { reasoning: { effort: 'low' } },
    })

    const awellSdk = await helpers.awellSdk()

    // Get care flow details for the disclaimer
    const careFlowDetails = await getCareFlowDetails(
      awellSdk,
      payload.pathway.id,
    )

    // 3. Get form data based on scope and formSelection.
    // An explicit step ID always targets that step, regardless of scope.
    type FormsData = Parameters<typeof getResponsesForAllForms>[0]['formsData']
    const toFormData = (forms: FormsData): string => {
      if (formSelection === 'All') {
        return getResponsesForAllForms({ formsData: forms }).result
      }
      const latestForm = forms[forms.length - 1]
      if (isNil(latestForm)) return ''
      return getFormResponseText({
        formDefinition: latestForm.formDefinition,
        formResponse: latestForm.formResponse,
      }).result
    }

    let formData: string

    if (scope === 'Track' && isNil(stepId)) {
      formData = toFormData(
        await getFormsInTrack({
          awellSdk,
          pathwayId: payload.pathway.id,
          activityId: payload.activity.id,
        }),
      )
    } else if (formSelection === 'Latest' && isNil(stepId)) {
      // Single latest form in current step (original behavior)
      const { formDefinition, formResponse } = await getLatestFormInCurrentStep(
        {
          awellSdk,
          pathwayId: payload.pathway.id,
          activityId: payload.activity.id,
        },
      )
      formData = getFormResponseText({ formDefinition, formResponse }).result
    } else {
      // The Step ID field holds a Studio definition ID; map it to the runtime ID
      const runtimeStepId = isNil(stepId)
        ? undefined
        : await resolveStepId({
            awellSdk,
            pathwayId: payload.pathway.id,
            stepId,
          })
      formData = toFormData(
        await getFormsInStep({
          awellSdk,
          pathwayId: payload.pathway.id,
          activityId: payload.activity.id,
          stepId: runtimeStepId,
        }),
      )
    }

    const scopeLabel = isNil(stepId)
      ? `the current ${scope.toLowerCase()}`
      : `step ${stepId}`

    if (formData === '') {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `No completed form found in ${scopeLabel}`,
            },
            error: {
              category: 'WRONG_INPUT',
              message: `No completed form found in ${scopeLabel}`,
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

    const { disclaimer, placement } = resolveDisclaimerConfig({
      actionDisclaimerText: disclaimerText,
      actionDisclaimerPlacement: disclaimerPlacement,
      tenantDisclaimerText,
      tenantDisclaimerPlacement,
      defaultDisclaimer: disclaimerMessage,
    })

    // 4. Generate summary
    const summary = await summarizeFormWithLLM({
      model,
      formData,
      summaryFormat,
      language: summaryLanguage,
      disclaimerMessage: disclaimer,
      disclaimerPlacement: placement,
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
