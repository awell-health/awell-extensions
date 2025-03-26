import { Twilio } from 'twilio/lib'

import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import twilioSdk from './sdk/twilio'

type ValidateAndCreateSdkClient = <P>(args: { payload: P }) => Promise<{
  client: Twilio
}>

export const validateAndCreateSdkClient: ValidateAndCreateSdkClient = async ({
  payload,
}) => {
  const {
    settings: { accountSid, authToken, clientId },
    settings,
  } = validate({
    schema: z.object({
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  if (clientId !== undefined) {
    const client = new Twilio(clientId, authToken, { accountSid })
    return { client, settings }
  } else {
    const client = twilioSdk(accountSid, authToken, {
      region: 'IE1',
      accountSid,
    })
    return { client }
  }
}
