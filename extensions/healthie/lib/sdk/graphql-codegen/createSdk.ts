import { type SettingsValues } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { getSdk } from './generated/sdk'
import { initialiseClient } from './graphqlClient'

type CreateSdkArgs = (args: {
  settings: SettingsValues<typeof settings>
}) => Promise<{
  sdk: ReturnType<typeof getSdk>
}>

/**
 * @deprecated DO NOT USE
 * DO NOT USE
 */
export const createSdk: CreateSdkArgs = async ({ settings }) => {
  const client = initialiseClient(settings)

  // Check if the client was successfully initialized
  if (client === undefined) {
    throw new Error(
      'There was a problem creating the Healthie GraphQL API Client. Please check your extension settings to validate the API URL and API Key.'
    )
  }

  const sdk = getSdk(client)

  return { sdk }
}
