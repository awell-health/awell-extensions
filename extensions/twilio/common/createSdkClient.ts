import { Twilio } from 'twilio/lib'

import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import twilioSdk from './sdk/twilio'

type createSdkClientParams = <P>(args: {
  payload: P
  skipRegion?: boolean
}) => Promise<{
  client: Twilio
}>

export const createSdkClient: createSdkClientParams = async ({
  payload,
  skipRegion = false,
}) => {
  const {
    settings: { accountSid, authToken, clientId, region },
  } = validate({
    schema: z.object({
      settings: SettingsValidationSchema,
    }),
    payload,
  })
  const options = skipRegion
    ? { accountSid }
    : { accountSid, region: region ?? 'IE1' }

  if (clientId !== undefined) {
    const client = new Twilio(clientId, authToken, options)
    return { client }
  } else {
    const client = twilioSdk(accountSid, authToken, options)
    return { client }
  }
}
