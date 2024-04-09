/* eslint-disable @typescript-eslint/naming-convention */
import { z, ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { letterSchema } from '../validation/letter.zod'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'ID of the patient',
    type: FieldType.NUMERIC,
    required: true,
  },
  practiceId: {
    id: 'practiceId',
    label: 'Practice',
    description: 'ID of a Practice',
    type: FieldType.NUMERIC,
    required: true,
  },
  referralOrderId: {
    id: 'referralOrderId',
    label: 'Referral Order ID',
    description: 'Id of the Referral Order (Not needed with subject)',
    type: FieldType.NUMERIC,
    required: false,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'Subject of the letter (Not needed with referral order)',
    type: FieldType.STRING,
    required: false,
  },
  body: {
    id: 'body',
    label: 'Body',
    description: 'Body of the letter',
    type: FieldType.TEXT,
    required: true,
  },
  contactNpi: {
    id: 'contactNpi',
    label: 'Contact NPI code',
    description: 'NPI of the contact whom you want to send this letter',
    type: FieldType.STRING,
    required: true,
  },
  letterType: {
    id: 'letterType',
    label: 'Type of letter',
    description:
      'Type of letter. Defaults to "provider". The type can be one of the following: "patient", "referral", "provider" or "patient_initiated".',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  letterId: {
    key: 'letterId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const postLetter: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'postLetter',
  category: Category.EHR_INTEGRATIONS,
  title: 'Post letter',
  description: "Post a letter using Elation's patient API.",
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        patientId,
        practiceId,
        referralOrderId,
        subject,
        body,
        contactNpi,
        letterType,
      } = payload.fields

      const contact_npi = z.string().parse(contactNpi)

      const api = makeAPIClient(payload.settings)

      const findContactsResponse = await api.searchContactsByNpi({
        npi: contact_npi,
      })

      if (
        findContactsResponse.count === 0 ||
        findContactsResponse.results.length === 0
      ) {
        throw new Error('No contact found with this NPI')
      }

      const contact = findContactsResponse.results[0]

      const letter = letterSchema.parse({
        patient: patientId,
        practice: practiceId,
        referral_order: referralOrderId,
        subject,
        body,
        letter_type: letterType,
        send_to_contact: {
          id: contact.id,
        },
      })

      const { id } = await api.postNewLetter(letter)
      await onComplete({
        data_points: {
          letterId: String(id),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
