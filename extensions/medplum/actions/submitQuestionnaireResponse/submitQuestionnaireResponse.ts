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
import { type QuestionnaireResponse } from '@medplum/fhirtypes'

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
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const awellSdk = await helpers.awellSdk()

    let formDefinition: Form
    let formResponse: FormResponse

    try {
      const formRes = await getLatestFormInCurrentStep({
        awellSdk,
        pathwayId: pathway.id,
        activityId: activity.id,
      })
      helpers.log({ meta, formRes }, 'Form response')
      formDefinition = formRes.formDefinition
      formResponse = formRes.formResponse
    } catch (error) {
      helpers.log({ meta, error }, 'Error')
      const err = error as Error
      await onError({
        events: [addActivityEventLog({ message: err.message })],
      })
      return
    }

    helpers.log(
      { meta, formDefinition, formResponse },
      'Form definition and response',
    )

    const FhirQuestionnaire =
      awellSdk.utils.fhir.AwellFormToFhirQuestionnaire(formDefinition)
    const FhirQuestionnaireResponse =
      awellSdk.utils.fhir.AwellFormResponseToFhirQuestionnaireResponseItems({
        awellFormDefinition: formDefinition,
        awellFormResponse: formResponse,
      })

    helpers.log(
      { meta, FhirQuestionnaire, FhirQuestionnaireResponse },
      'Fhir questionnaire and response',
    )

    helpers.log(
      { meta, FhirQuestionnaire },
      '[submitQuestionnaireResponse] Creating Medplum questionnaire resource',
    )

    const QuestionnaireResource = await medplumSdk.createResourceIfNoneExist(
      FhirQuestionnaire,
      `identifier=${formDefinition.definition_id}/published/${formDefinition.id}`,
    )

    helpers.log({ meta, QuestionnaireResource }, 'Questionnaire resource')

    const questionnaireResponseResource: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: `Questionnaire/${String(QuestionnaireResource.id)}`,
      status: 'completed',
      subject: {
        reference: `Patient/${
          extractResourceId(input.patientId, 'Patient') ?? 'undefined'
        }`,
      },
      item: FhirQuestionnaireResponse,
    }

    helpers.log(
      { meta, questionnaireResponseResource },
      '[submitQuestionnaireResponse] Creating Medplum questionnaire response',
    )

    const res = await medplumSdk.createResource(questionnaireResponseResource)

    helpers.log({ meta, res }, 'Questionnaire response')

    await onComplete({
      data_points: {
        questionnnaireResponseId: res.id,
      },
    })
  },
}
