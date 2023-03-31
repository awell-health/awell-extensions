import { type Action } from '@/types'
import { fields } from './config'
import { Category } from '@/types/marketplace'
import { type settings } from '@/extensions/dropboxSign/settings'
import { isEmpty, isNil } from 'lodash'
import DropboxSignSdk from '@/extensions/dropboxSign/common/sdk/dropboxSignSdk'

export const sendRequestReminder: Action<typeof fields, typeof settings> = {
  key: 'sendRequestReminder',
  title: 'Send request reminder',
  description:
    'Sends an email to the signer reminding them to sign the signature request. You cannot send a reminder within 1 hour of the last reminder that was sent. This includes manual AND automatic reminders.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { signatureRequestId, signerEmailAddress },
      settings: { apiKey },
    } = payload

    try {
      const allRequiredFieldsHaveValues = [
        signatureRequestId,
        signerEmailAddress,
      ].every((field) => !isEmpty(field))

      if (!allRequiredFieldsHaveValues) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`signatureRequestId`, `signerEmailAddress`',
              },
            },
          ],
        })
        return
      }

      if (isNil(apiKey)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Missing an API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing an API key',
              },
            },
          ],
        })
        return
      }

      const signatureRequestApi = new DropboxSignSdk.SignatureRequestApi()
      signatureRequestApi.username = apiKey

      const data: DropboxSignSdk.SignatureRequestRemindRequest = {
        emailAddress: String(signerEmailAddress),
      }

      await signatureRequestApi.signatureRequestRemind(
        String(signatureRequestId),
        data
      )

      await onComplete()
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
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
