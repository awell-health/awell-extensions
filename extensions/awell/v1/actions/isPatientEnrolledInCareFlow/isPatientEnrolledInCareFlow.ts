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
import { z } from 'zod'
import { type PatientPathway } from '@awell-health/awell-sdk'
import { isEmpty, isNil } from 'lodash'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'
import { PathwayStatus } from '../../gql/graphql'

const isWithinDayRange = (startDateIso: string, dayRange: number): boolean => {
  const startDate = new Date(startDateIso)
  const now = new Date()
  // Get difference between now and start date in milliseconds
  const diffTime = now.getTime() - startDate.getTime()
  // Convert to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  // Return true if start date is within the day range
  return diffDays <= dayRange
}

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
      fields: { pathwayStatus, careFlowDefinitionIds, dayRange },
    } = validate({
      schema: z.object({
        patient: PatientValidationSchema,
        pathway: PathwayValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    const {
      patientPathways: { patientPathways },
    } = await sdk.orchestration.query({
      patientPathways: {
        __args: {
          patient_id: patientId,
          filters: {
            status: {
              in: pathwayStatus ?? [PathwayStatus.Active]
            }
          },
        },
        patientPathways: {
          id: true,
          title: true,
          pathway_definition_id: true,
          release_id: true,
          start_date: true,
          complete_date: true,
          status: true,
        },
      },
    })

    const getCareFlowsThatMatchFilters = (): PatientPathway[] =>
      (patientPathways as PatientPathway[])
        // Exclude the current care flow instance
        .filter((careFlow) => careFlow.id !== pathwayId)
        // Filter by care flow definition ids
        .filter((careFlow) => {
          if (isNil(careFlowDefinitionIds) || isEmpty(careFlowDefinitionIds)) {
            return careFlow.pathway_definition_id === currentPathwayDefinitionId
          }

          return careFlowDefinitionIds.includes(careFlow.pathway_definition_id)
        })
        // Filter by day range
        .filter((careFlow) => {
          if (isNil(dayRange)) {
            return true
          }
          return isWithinDayRange(careFlow.start_date, dayRange)
        })

    const careFlows = getCareFlowsThatMatchFilters()
    const nbrOFResults = careFlows.length
    const isPatientEnrolledInCareFlowResult = nbrOFResults > 0

    await onComplete({
      data_points: {
        result: String(isPatientEnrolledInCareFlowResult),
        nbrOfResults: String(nbrOFResults),
        careFlowIds: careFlows.map((careFlow) => careFlow.id).join(','),
      },
      events: [
        addActivityEventLog({
          message: isPatientEnrolledInCareFlowResult
            ? `Patient was already enrolled in this care flow. Care flow IDs: ${careFlows
                .map((careFlow) => careFlow.id)
                .join(',')}`
            : `Patient was not previously enrolled in this care flow.`,
        }),
      ],
    })
  },
}
