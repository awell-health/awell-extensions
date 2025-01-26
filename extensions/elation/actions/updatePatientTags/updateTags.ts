import { type ElationAPIClient } from '../../client'

export const updateElationTags = async (api: ElationAPIClient, patientId: number, tags: string[]): Promise<void> => {
    if (tags.length === 0) {
      await api.updatePatient(patientId, {
        // Note: Empty array doesn't clear tags, but [''] does by setting '' as a tag and clearing the rest
        // TODO: Check the best approach with Elation since this does not clear the tags but sets '' as a tag
        tags: [''],
      })
    } else {
      await api.updatePatient(patientId, {
        tags,
      })
    }
  }
  