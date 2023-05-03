import {
  PubSub,
  type CreateSubscriptionOptions,
  type Message,
  type Subscription,
  type Topic,
} from '@google-cloud/pubsub'
import { type FastifyBaseLogger } from 'fastify'
import { environment } from '../lib/environment'
import type {
  Extension,
  NewActivityPayload,
  OnCompleteCallback,
  OnErrorCallback,
} from '../lib/types'

export class ExtensionServer {
  log: FastifyBaseLogger
  clients: PubSub[] = []
  subscriptions: Subscription[] = []
  topics: Topic[] = []
  constructor({ log }: { log: FastifyBaseLogger }) {
    this.log = log
  }

  async getSubscription(
    pubSubClient: PubSub,
    topic: Topic | string,
    name: string,
    options?: CreateSubscriptionOptions
  ): Promise<Subscription> {
    this.log.debug(
      { topic: (topic as Topic).name, subName: name, options },
      'Retrieving extension subscription'
    )
    const subscription = pubSubClient.subscription(name)

    /**
     * There is a strange bug with the `exists` function in the pubsub client
     * which causes it to fail with a DEADLINE_EXCEEDED error, with no clear
     * explanation of what causes it and how to prevent it.
     * Using the google api client instead prevents this from happening.
     */
    const subscriptionExists = async (): Promise<boolean> => {
      const [exists] = await subscription.exists()
      return exists
    }
    if (await subscriptionExists()) {
      return subscription
    }
    this.log.debug(
      { subName: subscription.name },
      'Creating new topic subscription'
    )
    const [newSubscription] = await pubSubClient.createSubscription(
      topic,
      name,
      options
    )
    return newSubscription
  }

  async init(): Promise<void> {
    for (const topic of this.topics) {
      const [topicExists] = await topic.exists()
      if (!topicExists) {
        this.log.debug({ name: topic.name }, 'Creating activity created topic')
      }
      await topic.create()
    }
  }

  async shutDown(): Promise<void> {
    await this.subscriptions.reduce(async (close, subscription) => {
      await close
      this.log.debug(
        { subscriptionName: subscription.name },
        'Closing subscription'
      )
      await subscription.close()
    }, Promise.resolve())
    await this.clients.reduce(async (close, client) => {
      await close
      await client.close()
    }, Promise.resolve())
  }
}

/**
 * JB Note: I duplicated the concept of the activity server because I thought
 * it would be useful. After getting 70% of the way there, I came to the
 * conclusion it was a wasted effort, but it's getting late, so I don't want
 * to delete until I'm certain.
 */

// export class ExtensionWebhookServer extends ExtensionServer {
//   webhookPreprocessedTopic: Topic
//   webhookReceivedTopic: Topic
//   constructor({ log }: { log: FastifyBaseLogger }) {
//     super({ log })
//     const pubSubClient = new PubSub()
//     this.webhookPreprocessedTopic = pubSubClient.topic(
//       environment.EXTENSION_WEBHOOK_PREPROCESSED_TOPIC
//     )
//     this.webhookReceivedTopic = pubSubClient.topic(
//       environment.EXTENSION_WEBHOOK_RECEIVED_TOPIC
//     )
//     this.clients = [pubSubClient]
//   }

//   async registerExtensionWebhooks(extension: Extension): Promise<void> {
//     const pubSubClient = new PubSub()
//     this.log.info({ key: extension.key }, 'Registering extension webhooks')
//     await Object.values(extension.webhooks ?? {}).reduce(
//       async (prevWebhookAction, webhookAction) => {
//         await prevWebhookAction
//         try {
//           const subscription = await this.getSubscription(
//             pubSubClient,
//             this.webhookPreprocessedTopic,
//             `${extension.key}-${webhookAction.key}`,
//             {
//               filter: `attributes.extension = "${extension.key}" AND attributes.action = "${webhookAction.key}"`,
//               enableExactlyOnceDelivery: true,
//             }
//           )
//           this.log.debug(
//             { extension: extension.key, webhook: webhookAction.key },
//             'Configuring extension webhook pre-processed subscription'
//           )
//           const createOnCompleteCallback = (
//             payload: WebhookPreProcessedPayload,
//             attributes: Attributes
//           ): OnWebhookComplete => {
//             return async (params = {}) => {
//               const data = Buffer.from(
//                 JSON.stringify({
//                   a: payload.headers,
//                 })
//               )
//               await this.webhookReceivedTopic.publishMessage({
//                 payload,
//                 attributes,
//               })
//             }
//           }
//           const createOnErrorCallback = (payload, attributes) => {
//             return async (params = {}) => {}
//           }
//           const handler = async (message: Message): Promise<void> => {
//             const { data, attributes } = message
//             const {
//               extension: extensionKey,
//               action: webhookActionKey,
//               headers,
//             } = attributes
//             if (
//               extensionKey === extension.key &&
//               webhookActionKey === webhookAction.key
//             ) {
//               await message.ackWithResponse()
//               const payload: WebhookPreProcessedPayload = JSON.parse(
//                 String(data)
//               )
//               const parsedHeaders = JSON.parse(headers)
//               await webhookAction.onWebhookReceived(
//                 { body: data, headers: parsedHeaders },
//                 createOnCompleteCallback(payload, attributes),
//                 createOnErrorCallback(payload, attributes)
//               )
//             }
//           }
//           subscription.on('message', handler)
//           subscription.on('error', (err) => {
//             this.log.error(err, 'webhook subscription error')
//           })
//         } catch (err) {
//           console.log('e')
//         }
//       },
//       Promise.resolve()
//     )
//   }
// }

export class ExtensionActivityServer extends ExtensionServer {
  activityCreatedTopic: Topic
  activityCompletedTopic: Topic
  constructor({ log }: { log: FastifyBaseLogger }) {
    super({ log })
    const pubSubClient = new PubSub()

    this.activityCreatedTopic = pubSubClient.topic(
      environment.EXTENSION_ACTIVITY_CREATED_TOPIC
    )
    this.activityCompletedTopic = pubSubClient.topic(
      environment.EXTENSION_ACTIVITY_COMPLETED_TOPIC
    )

    this.clients = [pubSubClient]
    this.topics = [this.activityCreatedTopic, this.activityCompletedTopic]
  }

  async registerExtensionActivities(extension: Extension): Promise<void> {
    const pubSubClient = new PubSub()
    this.log.info({ key: extension.key }, 'Registering extension activities')
    await Object.values(extension.actions).reduce(
      async (previousAction, action) => {
        await previousAction
        try {
          const subscription = await this.getSubscription(
            pubSubClient,
            this.activityCreatedTopic,
            `${extension.key}-${action.key}`,
            {
              filter: `attributes.extension = "${extension.key}" AND attributes.action = "${action.key}"`,
              enableExactlyOnceDelivery: true,
            }
          )
          this.log.debug(
            { extension: extension.key, action: action.key },
            'Configuring extension action subscription'
          )
          const createOnCompleteCallback = (
            payload: NewActivityPayload,
            attributes: Record<string, string>
          ): OnCompleteCallback => {
            return async (params = {}) => {
              const data = Buffer.from(
                JSON.stringify({
                  activity: payload.activity,
                  resolution: 'success',
                  ...params,
                })
              )
              await this.activityCompletedTopic.publishMessage({
                data,
                attributes,
              })
            }
          }
          const createOnErrorCallback = (
            payload: NewActivityPayload,
            attributes: Record<string, string>
          ): OnErrorCallback => {
            return async (params = {}) => {
              const data = Buffer.from(
                JSON.stringify({
                  activity: payload.activity,
                  resolution: 'failure',
                  ...params,
                })
              )
              await this.activityCompletedTopic.publishMessage({
                data,
                attributes,
              })
            }
          }

          const messageHandler = async (message: Message): Promise<void> => {
            const { attributes } = message
            const { extension: extensionKey, action: actionKey } = attributes
            // Extra check on attributes. This mainly serves local testing with the
            // pub sub emulator as it does not support filtering.
            if (extensionKey === extension.key && actionKey === action.key) {
              // this ack was at the back of the handler... why was that? cause of duplicates?
              await message.ackWithResponse()
              const payload: NewActivityPayload = JSON.parse(
                String(message.data)
              )
              this.log.debug(payload, 'New activity payload received')
              void action.onActivityCreated(
                payload,
                createOnCompleteCallback(payload, attributes),
                createOnErrorCallback(payload, attributes)
              )
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          subscription.on('message', messageHandler)

          subscription.on('error', (error) => {
            this.log.error(error, 'Subscription error')
          })
          this.subscriptions.push(subscription)
        } catch (err) {
          this.log.fatal(
            { err, extension: extension.key, action: action.key },
            'Extension registration failed'
          )
          throw err
        }
      },
      Promise.resolve()
    )
    this.log.info({ key: extension.key }, 'Extension registered successfully')
  }
}
