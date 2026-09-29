import { type AwellSdk } from '@awell-health/awell-sdk'

type GetStakeholderIdType = ({
  awellSdk,
  pathwayId,
  releaseId,
  patientId,
  stakeholder,
}: {
  awellSdk: AwellSdk
  pathwayId: string
  releaseId: string
  patientId?: string
  stakeholder: string
}) => Promise<string>

/**
 * Resolves the `stakeholder_id` to use for a given stakeholder name.
 *
 * For the patient stakeholder we must use the patient's actual id so the
 * result matches the behaviour of the patient hosted pages link. All other
 * stakeholders (e.g. care team) are role-based and are resolved to their
 * release stakeholder-definition id.
 */
export const getStakeholderId: GetStakeholderIdType = async ({
  awellSdk,
  pathwayId,
  releaseId,
  patientId,
  stakeholder,
}) => {
  const normalizedStakeholder = stakeholder.toLowerCase()

  const stakeholdersInRelease = await awellSdk.orchestration.query({
    stakeholdersByReleaseIds: {
      __args: {
        release_ids: [releaseId],
      },
      success: true,
      stakeholders: {
        id: true,
        label: {
          en: true,
        },
        definition_id: true,
        clinical_app_role: true,
      },
    },
  })

  const stakeholderMatch =
    stakeholdersInRelease.stakeholdersByReleaseIds.stakeholders.find(
      (s) => s.label.en.toLowerCase() === normalizedStakeholder,
    )

  if (stakeholderMatch === undefined)
    throw new Error(
      `Could not find stakeholder ID for ${normalizedStakeholder} in care flow ${pathwayId}`,
    )

  if (stakeholderMatch.clinical_app_role === 'PATIENT') {
    if (patientId === undefined)
      throw new Error(
        `Could not retrieve the patient ID for care flow ${pathwayId}.`,
      )

    return patientId
  }

  return stakeholderMatch.id
}
