import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { isEmpty, isNil } from 'lodash'
import AwellSdk from '../../../awell/v1/sdk/awellSdk'
import { type Reference, type QuestionnaireResponse } from '@medplum/fhirtypes'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const createCalculationObservation: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createCalculationObservation',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create calculation observation',
  description: 'Create a calculation observation in Medplum',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: input,
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
        'Please provide the Awell API key and Awell API URL in the settings of the Medplum extension to use this action.'
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

    const activitiesInCurrentStep = activities.filter(
      (a) =>
        a.context?.step_id === currentStepId &&
        a.status === 'DONE' &&
        a.date <= currentActivity.date
    )

    // Grab the most recent calculation activity
    const calculationActivityToPushToMedplum = activitiesInCurrentStep.filter(
      (a) => a.object.type === 'CALCULATION'
    )[0]

    if (isNil(calculationActivityToPushToMedplum))
      throw new Error(
        'No calculation action found in the current step to push to Medplum'
      )

    const calculationResults = await awellSdk.getCalculationResults({
      pathway_id: pathway.id,
      activity_id: calculationActivityToPushToMedplum.id,
    })

    const derivedFrom: Reference<QuestionnaireResponse> | null = !isEmpty(
      input.questionnaireResponseId
    )
      ? {
          reference: `QuestionnaireResponse/${
            extractResourceId(
              input.questionnaireResponseId ?? '',
              'QuestionnaireResponse'
            ) ?? 'undefined'
          }`,
        }
      : null

    const res = await medplumSdk.createResource({
      resourceType: 'Observation',
      status: 'final',
      code: {
        text: currentActivity.object.type,
      },
      category: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'survey',
              display: 'Survey',
            },
          ],
          text: currentActivity.object.type,
        },
      ],
      subject: {
        reference: `Patient/${
          extractResourceId(input.patientId, 'Patient') ?? 'undefined'
        }`,
      },
      performer: [
        {
          identifier: {
            system: 'https://awellhealth.com/activities/',
            value: activity.id,
          },
          display: 'Awell',
        },
      ],
      derivedFrom: [...(derivedFrom != null ? [derivedFrom] : [])],
      valueQuantity: {
        value: Number(calculationResults[0].value),
      },
    })

    await onComplete({
      data_points: {
        // @ts-expect-error should be fine
        observationId: res?.id,
      },
    })
  },
}
