import { type FastifyBaseLogger } from 'fastify'

import {
  PubSub,
  type Topic,
  type Message,
  type Subscription,
  type CreateSubscriptionOptions,
} from '@google-cloud/pubsub'
import { environment } from '../lib/environment'
import {
  type OnCompleteCallback,
  type OnErrorCallback,
  type NewActivityPayload,
} from '../lib/types'
import { type Extension } from '../lib/types/Extension'

export class ExtensionServer {
  log: FastifyBaseLogger
  pubSubClient: PubSub
  activityCreatedTopic: Topic
  activityCompletedTopic: Topic
  subscriptions: Subscription[] = []

  constructor({ log }: { log: FastifyBaseLogger }) {
    this.pubSubClient = new PubSub()
    this.log = log
    this.activityCreatedTopic = this.pubSubClient.topic(
      environment.EXTENSION_ACTIVITY_CREATED_TOPIC
    )
    this.activityCompletedTopic = this.pubSubClient.topic(
      environment.EXTENSION_ACTIVITY_COMPLETED_TOPIC
    )
  }

  async init(): Promise<void> {
    const [activityCreatedTopicExists] =
      await this.activityCreatedTopic.exists()
    if (!activityCreatedTopicExists) {
      this.log.debug(
        this.activityCreatedTopic.name,
        'Creating activity created topic'
      )
      await this.activityCreatedTopic.create()
    }
    const [activityCompletedTopicExists] =
      await this.activityCompletedTopic.exists()
    if (!activityCompletedTopicExists) {
      this.log.debug(
        this.activityCreatedTopic.name,
        'Creating activity completed topic'
      )
      await this.activityCompletedTopic.create()
    }
  }

  async getSubscription(
    topic: Topic | string,
    name: string,
    options?: CreateSubscriptionOptions
  ): Promise<Subscription> {
    this.log.debug(
      { topic: (topic as Topic).name, name, options },
      'Retrieving custom actions extension subscription'
    )
    const subscription = this.pubSubClient.subscription(name)
    const [exists] = await subscription.exists()
    if (exists) {
      return subscription
    }
    this.log.debug(subscription, 'Creating new topic subscription')
    const [newSubscription] = await this.pubSubClient.createSubscription(
      topic,
      name,
      options
    )
    return newSubscription
  }

  async registerExtension(extension: Extension): Promise<void> {
    this.log.info({ key: extension.key }, 'Registering extension')
    await Promise.all(
      Object.values(extension.actions).map(async (action) => {
        const subscription = await this.getSubscription(
          this.activityCreatedTopic,
          `${extension.key}-${action.key}`,
          {
            filter: `attributes.extension = "${extension.key}" AND attributes.action = "${action.key}"`,
            enableExactlyOnceDelivery: true,
          }
        )
        this.log.debug(action, 'Configuring extension action subscription')
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
            const payload: NewActivityPayload = JSON.parse(String(message.data))
            this.log.debug(payload, 'New activity payload received')
            void action.onActivityCreated(
              payload,
              createOnCompleteCallback(payload, attributes),
              createOnErrorCallback(payload, attributes)
            )
          }
          await message.ackWithResponse()
        }

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        subscription.on('message', messageHandler)

        subscription.on('error', (error) => {
          this.log.error(error, 'Subscription error')
        })
        this.subscriptions.push(subscription)
      })
    )
  }

  async shutDown(): Promise<void> {
    await this.subscriptions.reduce(async (close, subscription) => {
      await close
      this.log.debug({ name: subscription.name }, 'Closing subscription')
      await subscription.close()
    }, Promise.resolve())
  }
}
