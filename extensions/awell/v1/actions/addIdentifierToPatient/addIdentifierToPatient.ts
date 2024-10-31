import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { isEmpty } from 'lodash'

export const addIdentifierToPatient: Action<typeof fields, typeof settings> = {
  key: 'addIdentifierToPatient',
  category: Category.WORKFLOW,
  title: 'Add identifier to patient',
  description: "Add a new identifier to the patient's profile",
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { system, value },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const currentPatient = payload.patient

    const sdk = await helpers.awellSdk()

    const {
      patientByIdentifier: { patient: existingPatient },
    } = await sdk.orchestration.query({
      patientByIdentifier: {
        __args: { system, value },
        patient: {
          id: true,
        },
      },
    })

    const patientExists = !isEmpty(existingPatient?.id)
    const patientLookUpIsCurrentPatient =
      existingPatient?.id === currentPatient.id

    if (patientExists && !patientLookUpIsCurrentPatient) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Another patient (${String(
                existingPatient?.id
              )}) already has an identifier with system ${system} and value ${value}. Adding this identifier to the current patient is not possible.`,
            },
          },
        ],
      })
      return
    }

    // Filter identifiers, excluding any with the current system
    const existingIdentifiers = currentPatient?.profile?.identifier ?? []
    const otherIdentifiers = existingIdentifiers.filter(
      (id) => id.system !== system
    )

    const previousIdentifier = existingIdentifiers.find(
      (id) => id.system === system
    )
    const isUpdatingIdentifier = Boolean(previousIdentifier)

    if (isUpdatingIdentifier && previousIdentifier?.value === value) {
      await onComplete({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'Patient already had an identifier of the same value and system. No changes were made.',
            },
          },
        ],
      })
      return
    }

    // Perform update or add the new identifier
    await sdk.orchestration.mutation({
      updatePatient: {
        __args: {
          input: {
            patient_id: currentPatient.id,
            profile: {
              identifier: [...otherIdentifiers, { system, value }],
            },
          },
        },
        patient: {
          id: true,
        },
      },
    })

    await onComplete({
      events: [
        {
          date: new Date().toISOString(),
          text: {
            en: isUpdatingIdentifier
              ? `The patient already had an identifier with system ${system} and value ${String(
                  previousIdentifier?.value
                )}. The identifier value has been updated to ${value}.`
              : `The identifier with system ${system} and value ${value} has been added to the patient.`,
          },
        },
      ],
    })
  },
}
