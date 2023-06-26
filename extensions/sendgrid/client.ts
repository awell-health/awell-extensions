import sendgridMail, { type MailService } from '@sendgrid/mail'
import sendgridClient, { type Client } from '@sendgrid/client'

export class SendgridClient {
  private readonly _sendgridClient: Client
  private readonly _mailService: MailService

  constructor({ apiKey }: { apiKey: string }) {
    this._sendgridClient = sendgridClient
    this._sendgridClient.setApiKey(apiKey)

    this._mailService = sendgridMail
    this._mailService.setClient(this._sendgridClient)
  }

  readonly mail: { send: MailService['send'] } = {
    send: async (args) => await this._mailService.send(args),
  } as const
}
