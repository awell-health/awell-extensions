import {
  PubSub,
  type Subscription,
  type Attributes,
  type Message,
} from '@google-cloud/pubsub'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { randomUUID } from 'crypto'
import { isNil } from 'lodash'

import { environment } from '../lib/environment'
import type {
  Extension,
  OnWebhookError,
  OnWebhookSuccess,
  WebhookPreProcessedPayload,
  WebhookProcessedPayload,
} from '../lib/types'

const pubSubClient = new PubSub()

const webhookPreprocessedTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_PREPROCESSED_TOPIC
)
const webhookProcessedTopic = pubSubClient.topic(
  environment.EXTENSION_WEBHOOK_PROCESSED_TOPIC
)

export interface RegisterHandlerResponse {
  callbackId: string
  preProcessedSubscription: Subscription
}

export const createAndRegisterHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  extension: Extension
): Promise<RegisterHandlerResponse> => {
  // deconstructing the request so the body can be used in its raw form to validate
  // TODO: extract raw body
  const { headers } = request
  // we must first create the callback constructor functions for the handler.

  /**
   * onWebhookError builds a callback based on the message received from the
   * preProcessed subscription.
   * */
  const createOnErrorCallback = (
    payload: WebhookPreProcessedPayload<any>,
    attributes: Attributes
  ): OnWebhookError => {
    return async (params) => {
      const { response = { statusCode: 400 }, events } = params
      const webhookProcessedPayload: WebhookProcessedPayload = {
        response,
        events,
        inboundWebhookLogKey: payload.inboundWebhookLogRequestId,
      }
      const data = Buffer.from(JSON.stringify(webhookProcessedPayload))
      await reply
        .code(response.statusCode)
        .send(
          response.message ?? 'Something went wrong in processing your request.'
        )
      await webhookProcessedTopic.publishMessage({
        data,
        attributes,
      })
    }
  }

  /**
   * onWebhookSuccess builds a callback based on the message received from the
   * preProcessed subscription. What makes it different from onError are the
   * set of datapoints that the orchestrator can add into the pathway.
   * */
  const createOnCompleteCallback = (
    payload: WebhookPreProcessedPayload<any>,
    attributes: Attributes
  ): OnWebhookSuccess => {
    return async (params) => {
      const { response = { statusCode: 200 }, events, data_points } = params
      const webhookProcessedPayload: WebhookProcessedPayload = {
        response,
        events,
        data_points,
        inboundWebhookLogKey: payload.inboundWebhookLogRequestId,
      }
      const data = Buffer.from(String(webhookProcessedPayload))
      await reply.code(response.statusCode).send(response.message ?? 'ok')
      await webhookProcessedTopic.publishMessage({
        data,
        attributes,
      })
    }
  }

  const webhookHandler = async (message: Message): Promise<void> => {
    const { data, attributes } = message
    const { webhook_key: webhookActionKey } = attributes
    const webhook = extension.webhooks?.find((w) => w.key === webhookActionKey)
    if (isNil(webhook)) {
      await reply
        .code(404)
        .send(`unable to find a webhook key with the name ${webhookActionKey}`)
    } else {
      // I'm currently not sure what kind of "safety" this type definition provides...
      const payload: WebhookPreProcessedPayload<
        Parameters<(typeof webhook)['onWebhookReceived']>[0]['payload']
      > = JSON.parse(String(data))
      console.log(`processing webhook ${webhookActionKey}`)
      await webhook.onWebhookReceived(
        {
          payload: payload.payload,
          headers,
          rawBody: Buffer.from(String(payload)),
          settings: payload.settings,
        },
        createOnCompleteCallback(payload, attributes),
        createOnErrorCallback(payload, attributes)
      )
    }
  }

  const callbackId = randomUUID()
  const [preProcessedSubscription] =
    await webhookPreprocessedTopic.createSubscription(callbackId, {
      enableExactlyOnceDelivery: true,
    })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  preProcessedSubscription.once('message', webhookHandler)
  preProcessedSubscription.on('error', console.log)

  setTimeout(() => {
    const closeSub = async (): Promise<void> => {
      try {
        await preProcessedSubscription.close()
        if (!reply.sent) {
          await reply.code(500).send('timeout. something went wrong.')
        }
      } catch (err) {
        console.error(err)
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    closeSub()
  }, 3000)
  return {
    callbackId,
    preProcessedSubscription,
  }
}
