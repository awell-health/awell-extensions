import { type ElationAPIClient } from '../../client'

export const updateElationTags = async (api: ElationAPIClient, patientId: number, tags: string[]): Promise<void> => {
    if (tags.length === 0) {
      await api.updatePatient(patientId, {
        // Note: Empty array doesn't clear tags, but [''] does by setting '' as a tag and clearing the rest (so it is not actually removing all tags but setting '' as a tag)
        // This is also recommended workaround Elation team for clearing tags via API
        tags: [''],
      })
    } else {
      await api.updatePatient(patientId, {
        tags,
      })
    }
  }
  