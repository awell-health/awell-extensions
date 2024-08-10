export type SFDCApiType = 'marketing'

export const getAuthUrl = (apiType: SFDCApiType, subdomain: string): string => {
  if (apiType === 'marketing') {
    return `https://${subdomain}.auth.marketingcloudapis.com`
  }

  throw new Error(`No auth URL available for the SFDC ${apiType} API`)
}

export const getApiUrl = (apiType: SFDCApiType, subdomain: string): string => {
  if (apiType === 'marketing') {
    return `https://${subdomain}.rest.marketingcloudapis.com`
  }

  throw new Error(`No API URL available for the SFDC ${apiType} API`)
}
