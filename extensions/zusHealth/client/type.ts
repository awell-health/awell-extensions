import { type OAuthGrantClientCredentialsRequest } from '@awell-health/extensions-core'

export interface ZusAPIClientConstrutorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}
