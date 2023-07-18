import fetch from 'node-fetch'

export class WellinksClient {
  private readonly _apiUrl: string
  private readonly _apiKey: string
  constructor(apiUrl: string, apiKey: string) {
    this._apiKey = apiKey
    this._apiUrl = apiUrl
  }

  readonly memberListEvent = {
    insert: async ({
      eventName,
      memberId,
      sourceName,
      sendgridListId,
      originatorName,
      eventDate,
    }: {
      eventName: string
      memberId: string
      sourceName: string
      sendgridListId: string
      originatorName: string
      eventDate: string
    }): Promise<number> => {
      try {
        const response = await fetch(`${this._apiUrl}/memberListEvent/insert`, {
          method: 'POST',
          body: JSON.stringify({
            sendgrid_list_id: sendgridListId,
            list_event_name: eventName,
            list_event_source_name: sourceName,
            list_event_originator_name: originatorName,
            wellinks_member_id: memberId,
            event_date: eventDate,
          }),
          headers: {
            'x-api-key': this._apiKey,
          },
        })
        return response.status
      } catch {
        return 0
      }
    },
  }
}
