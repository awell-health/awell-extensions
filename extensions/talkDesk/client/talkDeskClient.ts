import {
  APIClient,
  DataWrapper,
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
  type DataWrapperCtor,
} from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../settings'
import { talkDeskCacheService } from './cache'

export class TalkDeskDataWrapper extends DataWrapper {}

interface TalkDeskAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class TalkDeskAPIClient extends APIClient<TalkDeskDataWrapper> {
  readonly ctor: DataWrapperCtor<TalkDeskDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new TalkDeskDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: TalkDeskAPIClientConstructorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
        cacheService: talkDeskCacheService,
      }),
    })
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): TalkDeskAPIClient => {
  const { baseUrl, authUrl, clientId, clientSecret } =
    SettingsValidationSchema.parse(payloadSettings)

  return new TalkDeskAPIClient({
    authUrl,
    requestConfig: { client_id: clientId, client_secret: clientSecret },
    baseUrl,
  })
}
