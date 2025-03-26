import { Twilio } from 'twilio/lib'

import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { SettingsValidationSchema } from '../settings'
import twilioSdk from './sdk/twilio'

type createSdkClientParams = <P>(args: { payload: P }) => Promise<{
  client: Twilio
}>

export const createSdkClient: createSdkClientParams = async ({ payload }) => {
  const {
    settings: { accountSid, authToken, clientId },
  } = validate({
    schema: z.object({
      settings: SettingsValidationSchema,
    }),
    payload,
  })

  if (clientId !== undefined) {
    const client = new Twilio(clientId, authToken, { accountSid })
    return { client }
  } else {
    const client = twilioSdk(accountSid, authToken, {
      region: 'IE1',
      accountSid,
    })
    return { client }
  }
}
