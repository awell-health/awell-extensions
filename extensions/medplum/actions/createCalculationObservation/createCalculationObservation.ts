import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { isEmpty, isNil } from 'lodash'
import { type Reference, type QuestionnaireResponse } from '@medplum/fhirtypes'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'
import {
  getLastCalculationActivityInCurrentStep,
  addActivityEventLog,
} from '../../../../src/lib/awell'
import { type Activity } from '@awell-health/awell-sdk'

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

    let latestCalculationActivity: Activity

    try {
      const res = await getLastCalculationActivityInCurrentStep({
        awellSdk,
        pathwayId: pathway.id,
        currentActivityId: activity.id,
      })

      if (isNil(res)) {
        throw new Error('No calculation activity found in the current step')
      }

      latestCalculationActivity = res
    } catch (error) {
      const err = error as Error
      await onError({
        events: [
          addActivityEventLog({
            message: err.message,
          }),
        ],
      })
      return
    }

    const calculationResultsResponse = await awellSdk.orchestration.query({
      calculationResults: {
        __args: {
          pathway_id: pathway.id,
          activity_id: latestCalculationActivity.id,
        },
        success: true,
        result: {
          __scalar: true,
        },
      },
    })

    const derivedFrom: Reference<QuestionnaireResponse> | null = !isEmpty(
      input.questionnaireResponseId,
    )
      ? {
          reference: `QuestionnaireResponse/${
            extractResourceId(
              input.questionnaireResponseId ?? '',
              'QuestionnaireResponse',
            ) ?? 'undefined'
          }`,
        }
      : null

    /**
     * We currently only support one result per calculation activity so
     * we use an imperfect heuristic to just get the first result of the calculation
     */
    const score =
      calculationResultsResponse.calculationResults?.result[0]?.value
    const isValidScore =
      !isNil(score) && !isNaN(Number(score)) && !isEmpty(score)

    const scoreResult = isValidScore
      ? { valueQuantity: { value: Number(score) } }
      : {
          dataAbsentReason: {
            coding: [
              {
                system: 'http://hl7.org/fhir/data-absent-reason',
                code: 'not-performed',
                display: 'Not Performed',
              },
            ],
          },
        }

    const res = await medplumSdk.createResource({
      resourceType: 'Observation',
      status: 'final',
      code: {
        text: latestCalculationActivity?.object?.name ?? 'Unknown',
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
          text: latestCalculationActivity?.object?.name ?? 'Unknown',
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
      ...scoreResult,
    })

    await onComplete({
      data_points: {
        // @ts-expect-error should be fine
        observationId: res?.id,
      },
    })
  },
}
