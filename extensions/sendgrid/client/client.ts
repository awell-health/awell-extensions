import sendgridMail, { type MailService } from '@sendgrid/mail'
import sendgridClient, { type Client } from '@sendgrid/client'
import { type MailApi, type MarketingApi } from './types'

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
    } as const,
  }
}
