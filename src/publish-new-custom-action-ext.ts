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
    secret: 'An extension secret',
  },
  token: '',
}
const extensionKey = 'hello-world'
const actionKey = 'log'

const publishNewActionExtension = async (): Promise<void> => {
  const pubSubClient = new PubSub()

  const activityCreatedTopic = pubSubClient.topic(
    environment.EXTENSION_ACTIVITY_CREATED_TOPIC
  )
  const data = Buffer.from(JSON.stringify(payload))
  await activityCreatedTopic.publishMessage({
    data,
    attributes: {
      extension: extensionKey,
      action: actionKey,
    },
  })
}

void publishNewActionExtension()
