import { type FastifyBaseLogger } from 'fastify'
import { google } from 'googleapis'
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
    // Authorize the google api client to use the pubsub API
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/pubsub',
      ],
    })
    const authClient = await auth.getClient()
    google.options({ auth: authClient })
  }

  async getSubscription(
    topic: Topic | string,
    name: string,
    options?: CreateSubscriptionOptions
  ): Promise<Subscription> {
    this.log.debug(
      { topic: (topic as Topic).name, subName: name, options },
      'Retrieving custom actions extension subscription'
    )
    const subscription = this.pubSubClient.subscription(name)

    /**
     * There is a strange bug with the `exists` function in the pubsub client
     * which causes it to fail with a DEADLINE_EXCEEDED error, with no clear
     * explanation of what causes it and how to prevent it.
     * Using the google api client instead prevents this from happening.
     */
    const subscriptionExists = async (): Promise<boolean> => {
      const response = await google
        .pubsub('v1')
        .projects.subscriptions.get({ subscription: subscription.name })
      return response.status === 200
    }
    if (await subscriptionExists()) {
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
    await Object.values(extension.actions).reduce(
      async (previousAction, action) => {
        await previousAction
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
      },
      Promise.resolve()
    )
    this.log.info({ key: extension.key }, 'Extension registered successfully')
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
  }
}
