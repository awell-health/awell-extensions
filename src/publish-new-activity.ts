import { PubSub } from '@google-cloud/pubsub'
import { environment } from '../lib/environment'
import { type NewActivityPayload } from '../lib/types'

const payload: NewActivityPayload = {
  activity: {
    id: 'e2e-test-activity',
  },
  fields: {
    text: 'A simple text message',
  },
  settings: {
    secret: 'A plugin secret',
  },
  token: '',
}
const pluginKey = 'hello-world'
const actionKey = 'log'

const publishNewActivity = async (): Promise<void> => {
  const pubSubClient = new PubSub()

  const activityCreatedTopic = pubSubClient.topic(
    environment.PLUGIN_ACTIVITY_CREATED_TOPIC
  )
  const data = Buffer.from(JSON.stringify(payload))
  await activityCreatedTopic.publishMessage({
    data,
    attributes: {
      plugin: pluginKey,
      action: actionKey,
    },
  })
}

void publishNewActivity()
