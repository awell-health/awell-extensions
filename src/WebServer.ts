import cors from '@fastify/cors'
import Fastify from 'fastify'
import { mapValues, omit } from 'lodash'
import { extensions } from '../extensions'
import {
  type Action,
  type Extension,
  type Field,
  type Setting,
  type Webhook,
} from '../lib/types'
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

export { webServer }
