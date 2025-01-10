import { type z } from 'zod'
import { type letterSchema } from '../validation/letter.zod'

export type GetLetterInputType = number

export interface GetLetterResponseType {
  id: number
  send_to_contact: {
    id: number
    first_name: string
    last_name: string
    org_name: string
    specialties: Array<{ id: number; name: string }>
    npi: string
  }
  send_to_name: string
  fax_to: string
  display_to: string
  to_number: string
  subject: string
  body: string
  fax_status: string
  fax_attachments: boolean
  delivery_method: string
  failure_unacknowledged: boolean
  direct_message_to: string
  email_to: string
  viewed_at: string
  send_to_elation_user: number
  delivery_date: string
  with_archive: boolean
  is_processed: boolean
  letter_type: string
  attachments: Array<{
    id: number
    document_type: string
  }>
  sign_date?: string
  signed_by?: number
  tags: string[]
  document_date: string
  patient: number
  practice: number
}

export type PostLetterInput = Pick<
  z.infer<typeof letterSchema>,
  | 'patient'
  | 'practice'
  | 'body'
  | 'subject'
  | 'referral_order'
  | 'letter_type'
  | 'send_to_contact'
>

export interface PostLetterResponse extends z.infer<typeof letterSchema> {
  id: number
}
