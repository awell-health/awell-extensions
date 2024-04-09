import sendgridMail, { type MailService } from '@sendgrid/mail'
import sendgridClient, { type Client } from '@sendgrid/client'
import { ResponseError, type Response } from '@sendgrid/helpers/classes'
import { type GroupsApi, type MailApi, type MarketingApi } from './types'
import { type ActivityEvent } from '@awell-health/extensions-core'
import { isNil } from 'lodash'

/**
 * We're using this validateStatus to help produce the expected result.
 * Unforunately, it's not documented well and the suggested action is to use .then() and .catch() instead.
 *
 * Something undocumented in the sendgrid client:
 * The response array [Response, any] in the callback is comprised of the response and the request body.
 * EDIT: ^^ incorrect. Still TBD, but removing validation for now.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateStatus =
  (validStatus: number) => (err?: ResponseError, response?: Response) => {
    if (!isNil(err)) {
      throw err
    }
    if (Number(response?.statusCode) !== Number(validStatus)) {
      throw Error(
        `Error: status response was ${
          response?.statusCode ?? ''
        }, was not ${validStatus}`
      )
    }
  }

export class SendgridClient {
  private readonly _sendgridClient: Client
  private readonly _mailService: MailService

  constructor({ apiKey }: { apiKey: string }) {
    this._sendgridClient = sendgridClient
    this._sendgridClient.setApiKey(apiKey)

    this._mailService = sendgridMail
    this._mailService.setClient(this._sendgridClient)
  }

  readonly mail: MailApi = {
    send: async (args) => await this._mailService.send(args),
  } as const

  readonly marketing: MarketingApi = {
    contacts: {
      addOrUpdate: async (args) => {
        return await (this._sendgridClient.request({
          url: '/v3/marketing/contacts',
          method: 'PUT',
          body: JSON.stringify({
            contacts: args.contacts,
            list_ids: args.listIds,
          }),
        }) as ReturnType<MarketingApi['contacts']['addOrUpdate']>)
      },
      importStatus: async (jobId) => {
        return await (this._sendgridClient.request({
          url: `/v3/marketing/contacts/imports/${jobId}`,
          method: 'GET',
        }) as ReturnType<MarketingApi['contacts']['importStatus']>)
      },
    } as const,
  } as const

  readonly groups = {
    suppressions: {
      add: async (groupId: string, email: string) => {
        return await (this._sendgridClient.request({
          url: `/v3/asm/groups/${groupId}/suppressions`,
          method: 'POST',
          body: {
            recipient_emails: [email],
          },
        }) as ReturnType<GroupsApi['suppressions']['add']>)
      },
      remove: async (groupId: string, email: string) => {
        return await (this._sendgridClient.request({
          url: `/v3/asm/groups/${groupId}/suppressions/${email}`,
          method: 'DELETE',
        }) as ReturnType<GroupsApi['suppressions']['remove']>)
      },
    } as const,
  } as const
}

interface ResponseErrorDetailed extends Omit<ResponseError, 'response'> {
  response: {
    body: {
      errors: Array<
        | {
            message: string
            field?: string
            help?: string
          }
        | string
      >
    }
  }
}

const isDetailedError = (error: any): error is ResponseErrorDetailed => {
  return (
    typeof error.response.body === 'object' &&
    'errors' in error.response.body &&
    Array.isArray(error.response.body.errors)
  )
}

export const mapSendgridErrorsToActivityErrors = (
  error: ResponseError
): ActivityEvent[] => {
  const errorTitle = `${error.message} (${error.code})`

  if (isDetailedError(error)) {
    const errorList = error.response.body.errors

    return errorList.map((errorItem) => {
      const text =
        typeof errorItem === 'string'
          ? errorItem
          : `${!isNil(errorItem.field) ? `${errorItem.field}: ` : ''}${
              errorItem.message
            }${!isNil(errorItem.help) ? `; Help: ${errorItem.help}` : ''}`
      return {
        date: new Date().toISOString(),
        text: { en: text },
        error: {
          category: 'SERVER_ERROR',
          message: text,
        },
      }
    })
  }

  return [
    {
      date: new Date().toISOString(),
      text: { en: errorTitle },
      error: {
        category: 'SERVER_ERROR',
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        message: `${JSON.stringify(error.response.body)}`,
      },
    },
  ]
}

export { ResponseError }
