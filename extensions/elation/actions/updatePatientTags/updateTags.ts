import { type ElationAPIClient } from '../../client'

export const updateElationTags = async (api: ElationAPIClient, patientId: number, tags: string[]): Promise<void> => {
    if (tags.length === 0) {
      await api.updatePatient(patientId, {
        tags: [],
      })
    } else {
      await api.updatePatient(patientId, {
        tags,
      })
    }
  }
  