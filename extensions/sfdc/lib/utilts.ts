import { SalesforceRestAPIClient } from '../api/client'
import { SalesforceTemporaryClient } from '../api/temporaryRestClient'

export const isSalesforceRestAPIClient = (
  client: SalesforceRestAPIClient | SalesforceTemporaryClient
): client is SalesforceRestAPIClient => {
  return client instanceof SalesforceRestAPIClient
}

export const isSalesforceTemporaryClient = (
  client: SalesforceRestAPIClient | SalesforceTemporaryClient
): client is SalesforceTemporaryClient => {
  return client instanceof SalesforceTemporaryClient
}
