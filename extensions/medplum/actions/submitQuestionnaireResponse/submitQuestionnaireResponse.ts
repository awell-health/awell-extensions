import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { isEmpty, isNil } from 'lodash'
import AwellSdk from '../../../awell/v1/sdk/awellSdk'
import {
  AwellFormResponseToFhirQuestionnaireResponseItems,
  AwellFormToFhirQuestionnaire,
} from '../../../../src/lib/fhir/transformers'

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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      medplumSdk,
      pathway,
      activity,
      settings: { awellApiKey, awellApiUrl },
    } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    if (isEmpty(awellApiKey) || isEmpty(awellApiUrl))
      throw new Error(
        'Please provide the well API key and Awell API URL in the settings of the Medplum extension to use this action.'
      )

    const awellSdk = new AwellSdk({
      apiUrl: awellApiUrl ?? '',
      apiKey: awellApiKey ?? '',
    })

    const activities = await awellSdk.getPathwayActivities({
      pathway_id: pathway.id,
    })

    const currentActivity = activities.find((a) => a.id === activity.id)

    if (isNil(currentActivity))
      throw new Error('Cannot find the current activity')

    const currentStepId = currentActivity.context?.step_id

    if (isNil(currentStepId))
      throw new Error('Could not find step ID of the current activity')

    const filteredFormActivities = activities.filter(
      (a) =>
        a.context?.step_id === currentStepId &&
        a.object.type === 'FORM' &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date
    )

    // Grab the most recent form activity
    const formActivityToPushToMedplum = filteredFormActivities[0]

    if (isNil(formActivityToPushToMedplum))
      throw new Error(
        'No form action found in the current step to push to Medplum'
      )

    const formDefinition = await awellSdk.getForm({
      id: formActivityToPushToMedplum.object.id,
    })

    const formResponse = await awellSdk.getFormResponse({
      pathway_id: pathway.id,
      activity_id: formActivityToPushToMedplum.id,
    })

    const FhirQuestionnaire = AwellFormToFhirQuestionnaire(formDefinition)

    const QuestionnaireResource = await medplumSdk.createResourceIfNoneExist(
      FhirQuestionnaire,
      `identifier=${formDefinition.definition_id}/published/${formDefinition.id}`
    )

    const res = await medplumSdk.createResource({
      resourceType: 'QuestionnaireResponse',
      questionnaire: `Questionnaire/${String(QuestionnaireResource.id)}`,
      status: 'completed',
      item: AwellFormResponseToFhirQuestionnaireResponseItems({
        awellFormDefinition: formDefinition,
        awellFormResponse: formResponse,
      }),
    })

    await onComplete({
      data_points: {
        // @ts-expect-error id is not included in the response type?
        questionnnaireResponseId: res.id,
      },
    })
  },
}
