import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type AxiosError } from 'axios'

export const signNonVisitNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'signNonVisitNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Sign non-visit note',
  description: 'Sign a non-visit note in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { nonVisitNoteId, signedBy } = FieldsValidationSchema.parse(
      payload.fields,
    )
    const api = makeAPIClient(payload.settings)

    /**
     * A non-visit note can only be signed by a physician.
     * We will validate if the signedBy is a physician and throw a readable error if not.
     */
    try {
      await api.getPhysician(signedBy)
    } catch (error) {
      await onError({
        events: [
          addActivityEventLog({
            message: `Failed to retrieve the physician (${signedBy}) to sign the note. Non-visit notes have to be signed by a physician.`,
          }),
        ],
      })
      return
    }

    try {
      await api.updateNonVisitNote(nonVisitNoteId, {
        signed_by: signedBy,
      })
    } catch (error) {
      const err = error as AxiosError

      if (err.status === 404) {
        await onError({
          events: [
            addActivityEventLog({
              message: `The non-visit note (${nonVisitNoteId}) does not exist.`,
            }),
          ],
        })
        return
      }

      if (err.status === 400) {
        const reason = JSON.stringify(err.response?.data)
        if (reason.includes('signed non visit notes are not editable')) {
          await onError({
            events: [
              addActivityEventLog({
                message: `Non-visit note was already signed and cannot be signed again.`,
              }),
            ],
          })
          return
        }
      }

      // All other errors we didn't handle explicitly we will throw
      throw error
    }

    await onComplete()
  },
}
