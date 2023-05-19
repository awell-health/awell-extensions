import Fastify from 'fastify'
import cors from '@fastify/cors'
import { mapValues, omit } from 'lodash'
import { environment } from '../lib/environment'
import {
  type Field,
  type Setting,
  type Extension,
  type Action,
  type Webhook,
} from '../lib/types'
import { extensions } from '../extensions'
import { PubSub } from '@google-cloud/pubsub'
import {
  getExtensionChangelog,
  getExtensionDocumentation,
} from './documentation'
import { logger } from './logger'

type ExtensionWebConfig = Omit<Extension, 'actions' | 'webhooks'> & {
  actions: Record<
    string,
    Omit<
      Action<Record<string, Field>, Record<string, Setting>>,
      'onActivityCreated'
    >
  >
  webhooks: Array<Omit<Webhook<string, unknown>, 'onWebhookReceived'>>
  htmlDocs: string
  changelog: string
}

const getExtensionConfig = (extension: Extension): ExtensionWebConfig => {
  return {
    ...extension,
    actions: mapValues(extension.actions, (action) =>
      omit(action, 'onActivityCreated')
    ),
    webhooks: (extension.webhooks ?? []).map((webhook) =>
      omit(webhook, 'onWebhookReceived')
    ),
    htmlDocs: getExtensionDocumentation(extension.key),
    changelog: getExtensionChangelog(extension.key),
  }
}

const webServer = Fastify({
  logger,
})

void webServer.register(cors, {
  origin: true,
})

webServer.get('/', async (request, reply) => {
  const allExtensions = extensions.map((extension) =>
    getExtensionConfig(extension)
  )
  await reply.send(allExtensions)
})

webServer.get('/:extensionKey', async (request, reply) => {
  const { extensionKey } = request.params as { extensionKey: string }
  const extension = extensions.find(({ key }) => key === extensionKey)
  if (extension === undefined) {
    await reply.status(404).send()
  } else {
    await reply.send(getExtensionConfig(extension))
  }
})

const pubSubClient = new PubSub()
const webhookTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_RECEIVED_TOPIC
)
webServer.post('/:extensionKey/webhook/:endpoint', async (request, reply) => {
  const { extensionKey, endpoint } = request.params as {
    extensionKey: string
    endpoint: string
  }
  const extension = extensions.find(({ key }) => key === extensionKey)
  if (extension === undefined) {
    await reply.status(404).send()
  } else {
    await reply.status(200).send()
    const payload = request.body
    const { webhooks = [] } = extension
    await Promise.all(
      webhooks.map(async (webhook) => {
        await webhook.onWebhookReceived(payload)
        const data = Buffer.from(JSON.stringify(dataPoints))
        await webhookTopic.publishMessage({
          data,
          attributes: {
            extension: extension.key,
            endpoint,
            webhook: webhook.key,
            environment: environment.AWELL_ENVIRONMENT,
          },
        })
      })
    )
  }
})

export { webServer }
