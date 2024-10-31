import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsValidationSchema,
  PatientValidationSchema,
} from './config'
import { z } from 'zod'
import { isEmpty } from 'lodash'

export const addIdentifierToPatient: Action<typeof fields, typeof settings> = {
  key: 'addIdentifierToPatient',
  category: Category.WORKFLOW,
  title: 'Add identifier to patient',
  description: "Add a new identifier to the patient's profile",
  fields,
  dataPoints,
  previewable: false, // Patients are not available in Preview; only cases.
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // Validate and extract the `system` and `value` fields and `currentPatientId` from the payload
    const {
      fields: { system, value },
      patient: { id: currentPatientId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    /**
     * Check if a patient with the same identifier system and value already exists.
     * This is necessary because identifier system-value pairs must be unique across all patients.
     */
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
      existingPatient?.id === currentPatientId

    /**
     * If a different patient already has the provided identifier, we cannot assign this identifier
     * to the current patient, as each identifier system-value pair must be unique.
     */
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

    /**
     * Although TypeScript indicates that `payload.patient.profile.identifier` should be accessible within `onEvent`,
     * tests in the Dev environment show that `identifier` data is not reliably available on the extension server.
     * To ensure accurate data, we directly query the API to retrieve the patient's current identifiers.
     */
    const currentPatientData = await sdk.orchestration.query({
      patient: {
        __args: {
          id: currentPatientId,
        },
        patient: {
          profile: {
            identifier: {
              system: true,
              value: true,
            },
          },
        },
      },
    })

    // Retrieve existing identifiers, excluding any with the specified system.
    const existingIdentifiers =
      currentPatientData?.patient?.patient?.profile?.identifier ?? []
    const existingIdentifierExcludingTheOneToUpdate =
      existingIdentifiers.filter((id) => id.system !== system)

    const previousIdentifier = existingIdentifiers.find(
      (id) => id.system === system
    )
    const isUpdatingIdentifier = !isEmpty(previousIdentifier)

    /**
     * If the patient already has this identifier system with the same value, we skip the update to avoid redundancy.
     */
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

    // Prepare the updated list of identifiers, including the new or updated identifier.
    const newIdentifiers = [
      ...existingIdentifierExcludingTheOneToUpdate,
      { system, value },
    ]

    /**
     * Perform the update to add or update the identifier on the patient's profile.
     * We retrieve the updated identifiers from the API response to ensure we log the final state.
     */
    const result = await sdk.orchestration.mutation({
      updatePatient: {
        __args: {
          input: {
            patient_id: currentPatientId,
            profile: {
              identifier: newIdentifiers,
            },
          },
        },
        patient: {
          id: true,
          profile: {
            identifier: {
              system: true,
              value: true,
            },
          },
        },
      },
    })

    const updatedIdentifiers =
      result?.updatePatient?.patient?.profile?.identifier ?? []

    // Log the result, including the old and new lists of identifiers.
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
        {
          date: new Date().toISOString(),
          text: {
            en: `Old list of identifiers: ${
              existingIdentifiers.length === 0
                ? 'None'
                : `${existingIdentifiers
                    .map((id) => `${id.system}|${id.value}`)
                    .join(';')}`
            }`,
          },
        },
        {
          date: new Date().toISOString(),
          text: {
            en: `Updated list of identifiers: ${updatedIdentifiers
              .map((id) => `${id.system}|${id.value}`)
              .join(';')}`,
          },
        },
      ],
    })
  },
}
