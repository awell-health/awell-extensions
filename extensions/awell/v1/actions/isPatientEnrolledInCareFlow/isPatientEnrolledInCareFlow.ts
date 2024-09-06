import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PatientValidationSchema,
  dataPoints,
  FieldsValidationSchema,
  PathwayValidationSchema,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { PathwayStatus, type PatientPathway } from '../../gql/graphql'
import { isEmpty, isNil } from 'lodash'

export const isPatientEnrolledInCareFlow: Action<
  typeof fields,
  typeof settings
> = {
  key: 'isPatientEnrolledInCareFlow',
  category: Category.WORKFLOW,
  title: 'Is patient already enrolled in care flow',
  description:
    'Checks whether the patient is already enrolled in the current care flow definition.',
  fields,
  dataPoints,
  previewable: false, // We don't have patients and pathways in Preview, only cases.
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      patient: { id: patientId },
      pathway: { id: pathwayId, definition_id: currentPathwayDefinitionId },
      fields: { pathwayStatus, careFlowDefinitionIds },
    } = validate({
      schema: z.object({
        patient: PatientValidationSchema,
        pathway: PathwayValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })
    const awellSdk = await helpers.awellSdk()
    const sdk = new AwellSdk({
      apiUrl: awellSdk.apiUrl!,
      apiKey: awellSdk.apiKey,
    })

    const results = await sdk.getPatientCareFlows({
      patient_id: patientId,
      status: pathwayStatus ?? [PathwayStatus.Active],
    })

    const getCareFlowsThatMatchFilters = (): PatientPathway[] =>
      results
        // Exclude the current care flow instance
        .filter((careFlow) => careFlow.id !== pathwayId)
        // Filter by care flow definition ids
        .filter((careFlow) => {
          if (isNil(careFlowDefinitionIds) || isEmpty(careFlowDefinitionIds)) {
            return careFlow.pathway_definition_id === currentPathwayDefinitionId
          }

          return careFlowDefinitionIds.includes(careFlow.pathway_definition_id)
        })
        // Filter by status
        .filter((careFlow) => {
          if (isNil(pathwayStatus) || isEmpty(pathwayStatus)) {
            return careFlow.status === PathwayStatus.Active
          }

          return pathwayStatus.includes(careFlow.status)
        })

    const careFlows = getCareFlowsThatMatchFilters()
    const isPatientEnrolledInCareFlowResult = careFlows.length > 0

    await onComplete({
      data_points: {
        result: String(isPatientEnrolledInCareFlowResult),
        nbrOfResults: String(careFlows.length),
        careFlowIds: careFlows.map((careFlow) => careFlow.id).join(','),
      },
    })
  },
}
