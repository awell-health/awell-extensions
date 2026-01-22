import { WebClient, type ChatPostMessageResponse } from '@slack/web-api'
import { type ActivityEvent } from '@awell-health/extensions-core'

export class SlackClient {
  private readonly client: WebClient

  constructor({ botToken }: { botToken: string }) {
    this.client = new WebClient(botToken)
  }

  async postMessage({
    channel,
    text,
  }: {
    channel: string
    text: string
  }): Promise<ChatPostMessageResponse> {
    return await this.client.chat.postMessage({
      channel,
      text,
    })
  }
}

interface SlackErrorResponse {
  code: string
  data: {
    ok: boolean
    error: string
  }
}

export const isSlackErrorResponse = (error: unknown): error is SlackErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'data' in error &&
    typeof (error as SlackErrorResponse).data === 'object' &&
    (error as SlackErrorResponse).data !== null &&
    'error' in (error as SlackErrorResponse).data
  )
}

export const mapSlackErrorToActivityEvent = (error: SlackErrorResponse): ActivityEvent => {
  const errorMessage = error.data.error

  const errorMessages: Record<string, string> = {
    channel_not_found: 'The specified channel was not found. Make sure the channel exists and the bot has been invited to it.',
    not_in_channel: 'The bot is not a member of the channel. Invite the bot to the channel using /invite @botname.',
    is_archived: 'The channel has been archived and cannot receive messages.',
    msg_too_long: 'The message text is too long.',
    no_text: 'No message text was provided.',
    invalid_auth: 'The bot token is invalid or has been revoked.',
    account_inactive: 'The Slack workspace associated with this token has been deleted.',
    token_revoked: 'The bot token has been revoked.',
    missing_scope: 'The bot token is missing the required chat:write scope.',
  }

  const friendlyMessage = errorMessages[errorMessage] ?? `Slack API error: ${errorMessage}`

  return {
    date: new Date().toISOString(),
    text: { en: friendlyMessage },
    error: {
      category: 'SERVER_ERROR',
      message: friendlyMessage,
    },
  }
}
