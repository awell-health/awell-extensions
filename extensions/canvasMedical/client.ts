import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
} from '../../lib/shared/client'
import {
  type OAuthGrantClientCredentialsRequest,
  OAuthClientCredentials,
} from '../../lib/shared/auth'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'

export class CanvasDataWrapper extends DataWrapper {}

interface CanvasAPIClientConstrutorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export class CanvasAPIClient extends APIClient<CanvasDataWrapper> {
  readonly ctor: DataWrapperCtor<CanvasDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new CanvasDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: CanvasAPIClientConstrutorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): CanvasAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    settingsSchema.parse(payloadSettings)

  return new CanvasAPIClient({
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}
