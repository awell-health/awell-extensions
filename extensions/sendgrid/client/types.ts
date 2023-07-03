import { type MailService } from '@sendgrid/mail'
import { type Response } from '@sendgrid/helpers/classes'

type RequestReturnType<T = object> = Promise<[Response<T>, T]>

export interface Contact {
  address_line_1?: string
  address_line_2?: string
  alternate_emails?: string[]
  city?: string
  country?: string
  email: string
  first_name?: string
  last_name?: string
  postal_code?: string
  state_province_region?: string
  custom_fields?: object
}

export interface MailApi {
  send: MailService['send']
}
export interface MarketingApi {
  contacts: {
    addOrUpdate: (args: {
      listIds?: string[]
      contacts: Contact[]
    }) => RequestReturnType<{ job_id: string }>
  }
}
