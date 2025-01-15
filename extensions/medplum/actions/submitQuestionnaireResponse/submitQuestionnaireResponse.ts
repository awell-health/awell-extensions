import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'
import {
  addActivityEventLog,
  getLatestFormInCurrentStep,
} from '../../../../src/lib/awell'
import { type Form, type FormResponse } from '@awell-health/awell-sdk'

export const submitQuestionnaireResponse: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'submitQuestionnaireResponse',
  category: Category.EHR_INTEGRATIONS,
  title: 'Submit questionnaire response',
  description:
    'Creates a questionnaire response in Medplum for the latest submitted form in the current step',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: input,
      medplumSdk,
      pathway,
      activity,
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const awellSdk = await helpers.awellSdk()

    let formDefinition: Form
    let formResponse: FormResponse

    try {
      const formRes = await getLatestFormInCurrentStep({
        awellSdk,
        pathwayId: pathway.id,
        activityId: activity.id,
      })

      formDefinition = formRes.formDefinition
      formResponse = formRes.formResponse
    } catch (error) {
      const err = error as Error
      await onError({
        events: [addActivityEventLog({ message: err.message })],
      })
      return
    }

    const FhirQuestionnaire =
      awellSdk.utils.fhir.AwellFormToFhirQuestionnaire(formDefinition)
    const FhirQuestionnaireResponse =
      awellSdk.utils.fhir.AwellFormResponseToFhirQuestionnaireResponseItems({
        awellFormDefinition: formDefinition,
        awellFormResponse: formResponse,
      })

    const QuestionnaireResource = await medplumSdk.createResourceIfNoneExist(
      FhirQuestionnaire,
      `identifier=${formDefinition.definition_id}/published/${formDefinition.id}`,
    )

    const res = await medplumSdk.createResource({
      resourceType: 'QuestionnaireResponse',
      questionnaire: `Questionnaire/${String(QuestionnaireResource.id)}`,
      status: 'completed',
      subject: {
        reference: `Patient/${
          extractResourceId(input.patientId, 'Patient') ?? 'undefined'
        }`,
      },
      item: FhirQuestionnaireResponse,
    })

    await onComplete({
      data_points: {
        // @ts-expect-error id is not included in the response type?
        questionnnaireResponseId: res.id,
      },
    })
  },
}
