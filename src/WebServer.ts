import Fastify from 'fastify'
import cors from '@fastify/cors'
import { isNil, mapValues, omit } from 'lodash'
import { environment } from '../lib/environment'
import {
  type Field,
  type Setting,
  type Extension,
  type Action,
  type Webhook,
  type WebhookPreProcessedPayload,
  type OnWebhookSuccess,
  OnWebhookError,
} from '../lib/types'
import { extensions } from '../extensions'
import { type Message, PubSub, type Attributes } from '@google-cloud/pubsub'
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
const webhookReceivedTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_RECEIVED_TOPIC
)
const webhookPrereceivedTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_PRERECEIVED_TOPIC
)
const webhookPreprocessedTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_PREPROCESSED_TOPIC
)
/**
 * @param :endpoint is a uuid created by awell when stef creates an endpoint, so it can be used as an identifier
 */

webServer.post(
  '/:extensionKey/webhook/:endpoint',
  { config: { rawBody: true } },
  async (request, reply) => {
    const { extensionKey, endpoint } = request.params as {
      extensionKey: string
      endpoint: string
    }
    const extension = extensions.find(({ key }) => key === extensionKey)
    if (extension === undefined) {
      await reply.status(404).send()
    } else {
      // !TODO we should really be passing the raw body here, and should not be using stringify. Will mess up sha-1 validation.
      const data = Buffer.from(
        JSON.stringify({
          body: request.body,
          headers: request.headers,
        })
      )

      // Keep in mind these next 35-40 lines come into play AFTER
      // we publish the message in the webhook-pre-received topic
      // -------------
      const callbackId = `${extensionKey}-${endpoint}-${new Date().valueOf()}`
      const [createSub] = await webhookPreprocessedTopic.createSubscription(
        callbackId,
        {
          enableExactlyOnceDelivery: true,
        }
      )

      const createOnCompleteCallback = (
        payload: WebhookPreProcessedPayload,
        attributes: Attributes
      ): OnWebhookSuccess => {
        return async (params = { statusCode: 200 }) => {
          const data = Buffer.from(
            JSON.stringify({
              headers: payload.headers,
              payload: payload.payload,
              inboundWebhookLogRequestId: payload.inboundWebhookLogRequestId,
            })
          )
          await reply.code(params.statusCode).send('ok')
          await webhookReceivedTopic.publishMessage({
            data,
            attributes,
          })
        }
      }
      const createOnErrorCallback = (
        payload: WebhookPreProcessedPayload,
        attributes: Attributes
      ): OnWebhookError => {
        return async (params = { statusCode: 400 }) => {
          const data = Buffer.from(
            JSON.stringify({
              headers: payload.headers,
              payload: payload.payload,
              inboundWebhookLogRequestId: payload.inboundWebhookLogRequestId,
            })
          )
          await reply.code(params.statusCode).send('not ok')
          await webhookReceivedTopic.publishMessage({
            data,
            attributes,
          })
        }
      }

      const theHandler = async (message: Message): Promise<void> => {
        const { data, attributes } = message
        const payload: WebhookPreProcessedPayload = JSON.parse(String(data))
        const {
          // extension: extensionKey, // i don't think we need this bc of above
          webhook_key: webhookActionKey,
          headers,
        } = attributes
        const theWebhook = extension.webhooks?.find(
          (w) => w.key === webhookActionKey
        )
        if (isNil(theWebhook)) {
          await reply
            .code(404)
            .send(
              `unable to find a webhook key with the name ${webhookActionKey}`
            )
        } else {
          console.log('handling webhook...')
          await theWebhook.onWebhookReceived(
            {
              payload: payload.payload,
              headers: JSON.parse(headers),
              rawBody: Buffer.from(String(payload)),
              settings: payload.settings,
            },
            createOnCompleteCallback(payload, attributes),
            createOnErrorCallback(payload, attributes)
          )
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      createSub.once('message', theHandler)
      createSub.on('error', console.log)

      // i know this is garbage
      void setTimeout(() => {
        createSub
          .close()
          .then(() => {
            console.log('closed subscription')
          })
          .catch(console.log)
        if (!reply.sent) {
          reply
            .code(500)
            .send('uh oh')
            .then(
              () => {
                console.log('uh oh')
              },
              (err) => {
                console.log('double uh oh', err)
              }
            )
        }
      }, 3000)
      // --------------

      // For completeness of documentation, we publish this message
      // and expect a response back in the next three seconds in the
      // subscription above.
      await webhookPrereceivedTopic.publishMessage({
        data,
        attributes: {
          extension: extension.key,
          endpoint,
          headers: JSON.stringify(request.headers),
          environment: environment.AWELL_ENVIRONMENT,
          callbackId,
        },
      })

      // THIS IS THE OLD STUFF
      // await reply.status(200).send()
      // const payload = request.body
      // const { webhooks = [] } = extension
      // await Promise.all(
      //   webhooks.map(async (webhook) => {
      //     const dataPoints = await webhook.onWebhookReceived(payload)
      //     const data = Buffer.from(JSON.stringify(dataPoints))
      //     await webhookReceivedTopic.publishMessage({
      //       data,
      //       attributes: {
      //         extension: extension.key,
      //         endpoint,
      //         webhook: webhook.key,
      //         environment: environment.AWELL_ENVIRONMENT,
      //       },
      //     })
      //   })
      // )
    }
  }
)

export { webServer }
