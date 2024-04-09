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

export enum ImportStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ERRORED = 'errored',
  FAILED = 'failed',
}

export interface ImportStatusResponse {
  id: string
  status: ImportStatus
  finished_at?: string
  job_type: string
  started_at: string
}

// interface ResponseError {
//   errors: any
// }

// export function isResponseError(resp: any): resp is ResponseError {
//   return typeof resp === 'object' && 'errors' in resp
// }

export interface MailApi {
  send: MailService['send']
}
export interface MarketingApi {
  contacts: {
    addOrUpdate: (args: {
      listIds?: string[]
      contacts: Contact[]
    }) => RequestReturnType<{ job_id: string }>
    importStatus: (jobId: string) => RequestReturnType<ImportStatusResponse>
  }
}

export interface GroupsApi {
  suppressions: {
    add: (
      group: string,
      emails: string[]
    ) => RequestReturnType<{ recipient_emails: string[] }>
    remove: (group: string, emails: string[]) => RequestReturnType<any> // null response
  }
}
