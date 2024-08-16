export type SFDCApiType = 'REST'
export type GrantType = 'password' | 'client_credentials'

export const DEFAULT_API_VERSION = 'v61.0'

export const getAuthUrl = (
  apiType: SFDCApiType,
  grant_type: GrantType,
  subdomain: string
): string => {
  if (grant_type === 'password')
    return 'https://test.salesforce.com/services/oauth2/token'

  if (apiType === 'REST') {
    return `https://${subdomain}.my.salesforce.com/services/oauth2/token`
  }

  throw new Error(
    `No auth URL available for the Salesforce ${apiType as string} API`
  )
}

export const getApiUrl = (apiType: SFDCApiType, subdomain: string): string => {
  if (apiType === 'REST') {
    return `https://${subdomain}.my.salesforce.com`
  }

  throw new Error(`No API URL available for the SFDC ${apiType as string} API`)
}
