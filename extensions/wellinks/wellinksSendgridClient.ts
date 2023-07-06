import sendgridClient, { type Client } from "@sendgrid/client";


export class WellinksSendgridClient {
  private readonly _sendgridClient: Client
  
  constructor(apiKey: string ) {
    this._sendgridClient = sendgridClient
    this._sendgridClient.setApiKey(apiKey)
  }

  readonly groups = {
    addSuppression: async (groupId: string, email: string) => {
      return await (this._sendgridClient.request({
        url: `/v3/asm/groups/${groupId}/suppressions`,
        method: 'POST',
        body: {
          "recipient_emails": [
            email
          ]
        }
      }))
    }
  }
}