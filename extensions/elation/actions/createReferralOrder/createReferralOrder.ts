import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { AxiosError } from 'axios'

/**
 * Important to know as the documentation is out of date:
 * - The specialty has to refer to an existing specialty in Elation. I can't find documentation on how to get
 * the list of specialties which means there is no way for us to validate that the field is OK.
 * - The send to contact field is required when creating a letter but again, not documented so unclear how to set it properly.
 */
export const createReferralOrder: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createReferralOrder',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create referral order',
  description: 'Create a referral order in Elation.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
      const {
        patient,
        practice,
        contact_name,
        body,
        authorization_for,
        consultant_name,
        specialty,
      } = FieldsValidationSchema.parse(payload.fields)
      const api = makeAPIClient(payload.settings)

      const contactsResponse = await api.searchContactsByName({
        name: contact_name,
      })

      if (contactsResponse.count === 0) {
        throw new Error(`No contact found with the name ${contact_name}.`)
      }

      const contact = contactsResponse.results[0]

      const createReferralOrderRequest = {
        authorization_for,
        consultant_name,
        short_consultant_name: consultant_name,
        practice,
        patient,
        specialty: { name: specialty },
        // Setting these to null as we don't know whether they are useful or not.
        // If needed we can add them to the action fields.
        auth_number: null,
        date_for_reEval: null,
        resolution: null,
      }

      helpers.log(
        { meta, createReferralOrderRequest },
        'Creating Elation referral order',
      )

      const referralOrderResponse = await api.createReferralOrder(
        createReferralOrderRequest,
      )

      const postLetterRequest = {
        patient,
        practice,
        body,
        referral_order: referralOrderResponse.id,
        send_to_contact: { id: contact.id },
        letter_type: 'referral' as const,
      }

      helpers.log(
        { meta, postLetterRequest },
        'Posting Elation referral order letter',
      )

      await api.postNewLetter(postLetterRequest)

      await onComplete({
        data_points: {
          id: String(referralOrderResponse.id),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      if (err instanceof AxiosError) {
        const responseData = (err as AxiosError).response?.data
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error data: ${JSON.stringify(responseData, null, 2)}`,
              },
            },
          ],
        })
      } else {
        throw err
      }
    }
  },
}
