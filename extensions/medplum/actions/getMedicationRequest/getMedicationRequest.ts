import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateSdkClient } from '../../utils'
import { extractResourceId } from '../../utils/extractResourceId/extractResourceId'

export const getMedicationRequest: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getMedicationRequest',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get medication request',
  description: 'Retrieve medication request details from Medplum',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing getMedicationRequest',
    )

    try {
      const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const resourceId =
        extractResourceId(input.resourceId, 'MedicationRequest') ?? ''

      const res = await medplumSdk.readResource('MedicationRequest', resourceId)

      const getPatientId = (): string | null => {
        const subjectReference = res.subject?.reference ?? ''

        if (subjectReference.startsWith('Patient')) {
          return extractResourceId(subjectReference, 'Patient')
        }

        return null
      }

      const getMedicationDisplay = (): string => {
        if (
          res.medicationCodeableConcept?.coding?.[0]?.display !== undefined &&
          res.medicationCodeableConcept.coding[0].display !== ''
        ) {
          return res.medicationCodeableConcept.coding[0].display
        }
        if (
          res.medicationCodeableConcept?.text !== undefined &&
          res.medicationCodeableConcept.text !== ''
        ) {
          return res.medicationCodeableConcept.text
        }
        if (
          res.medicationReference?.display !== undefined &&
          res.medicationReference.display !== ''
        ) {
          return res.medicationReference.display
        }
        return ''
      }

      const getDosageInstructions = (): string => {
        if (
          res.dosageInstruction?.[0]?.text !== undefined &&
          res.dosageInstruction[0].text !== ''
        ) {
          return res.dosageInstruction[0].text
        }
        return ''
      }

      await onComplete({
        data_points: {
          medicationRequest: JSON.stringify(res),
          status: res.status,
          intent: res.intent,
          priority: res.priority,
          medicationDisplay: getMedicationDisplay(),
          dosageInstructions: getDosageInstructions(),
          patientId: getPatientId(),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
