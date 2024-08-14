export type SFDCApiType = 'REST'

export const DEFAULT_API_VERSION = 'v61.0'

export const getAuthUrl = (apiType: SFDCApiType, subdomain: string): string => {
  if (apiType === 'REST') {
    return `https://${subdomain}.my.salesforce.com/services/oauth2/token`
  }

  throw new Error(`No auth URL available for the SFDC ${apiType} API`)
}

export const getApiUrl = (apiType: SFDCApiType, subdomain: string): string => {
  if (apiType === 'REST') {
    return `https://${subdomain}.my.salesforce.com`
  }

  throw new Error(`No API URL available for the SFDC ${apiType} API`)
}
