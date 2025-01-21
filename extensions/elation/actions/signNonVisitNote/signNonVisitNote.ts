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

        /**
         * A non-visit note can be signed by a Physician or an Office Staff.
         * You cannot sign a non-visit note using a User ID.
         * If you pass an invalid ID, you will get a 400 error with a message like:
         * "Invalid pk \"1425910919331837\" - object does not exist."
         */
        if (reason.includes('Invalid pk')) {
          await onError({
            events: [
              addActivityEventLog({
                message: `The signedBy field is not a valid physician or office staff.`,
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
