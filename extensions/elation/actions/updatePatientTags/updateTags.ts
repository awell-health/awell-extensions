import { type ElationAPIClient } from '../../client'

export const updateElationTags = async (api: ElationAPIClient, patientId: number, tags: string[]): Promise<void> => {
    if (tags.length === 0) {
      await api.updatePatient(patientId, {
        // @ts-expect-error - elation api does not clear tags on an empty array
        tags: ' ',
      })
    } else {
      await api.updatePatient(patientId, {
        tags,
      })
    }
  }
  