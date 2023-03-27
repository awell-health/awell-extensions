/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ElationAPIClient, makeDataWrapper } from '../client'
import settings from './settings.local.json'

const api = new ElationAPIClient({
  auth: {
    ...settings,
    auth_url: 'https://sandbox.elationemr.com/api/2.0/oauth2/token',
  },
  baseUrl: 'https://sandbox.elationemr.com/api/2.0',
  makeDataWrapper,
})

const getSubs = async (opts: { removeResource?: string | null }) => {
  const subs = await api.findSubscriptions()
  if (subs.length > 0) {
    if (opts.removeResource != null) {
      return await Promise.all(
        subs
          .filter((s) => s.resource === opts.removeResource)
          .map(async (s) => {
            await api.deleteSubscription(s.id)
            return `Deleted subscription id ${s.id}`
          })
      )
    } else {
      return subs
    }
  }
  return []
}
const createSub = async () => {
  return await api.createSubscription({
    resource: 'patients',
    target: 'https://5f88-72-197-193-6.ngrok.io',
    properties: null,
  })
}
// createSub().then(console.log).catch(console.error)

// Change removeResource to a resource type (e.g. `patients`) to remove those webhooks, then feel free to create a new one.
// use null to view all webhooks
getSubs({ removeResource: null }).then(console.log).catch(console.log)

export {}
