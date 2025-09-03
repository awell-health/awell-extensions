declare const Buffer: any

declare const Buffer: any

type CreateTicketInput = {
  external_id?: string
  subject: string
  comment: string
  requester_email: string
  requester_name?: string
  tag?: string
}

type CreateTicketResponse = {
  id: number
  url: string
  created_at: string
}

export class ZendeskSupportClient {
  private subdomain: string
  private email: string
  private apiToken: string

  constructor(params: { subdomain: string; email: string; apiToken: string }) {
    this.subdomain = params.subdomain
    this.email = params.email
    this.apiToken = params.apiToken
  }

  async createTicket(input: CreateTicketInput): Promise<CreateTicketResponse> {
    const url = `https://${this.subdomain}.zendesk.com/api/v2/tickets.json`
    const authUser = `${this.email}/token`
    const authPass = this.apiToken
    const tags = input.tag ? [input.tag] : undefined

    const payload = {
      ticket: {
        external_id: input.external_id,
        subject: input.subject,
        comment: { body: input.comment },
        requester: {
          email: input.requester_email,
          name: input.requester_name,
        },
        tags,
      },
    }

    const authHeader =
      'Basic ' +
      (Buffer as any).from(`${authUser}:${authPass}`, 'utf8').toString('base64')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(
        `Zendesk Support API error ${res.status} ${res.statusText}: ${text}`
      )
    }

    const data = await res.json()
    const t = data?.ticket
    return {
      id: t.id,
      url: t.url,
      created_at: t.created_at,
    }
  }
}
