/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'
import bodyParser from 'body-parser'
import {
  type NewActivityPayload,
  type OnCompleteCallback,
  type OnErrorCallback,
  AwellError,
} from '@awell-health/extensions-core'
import { extensions } from '../extensions'

const app = express()
const port = 3000

type QueueInput = (
  | Parameters<OnCompleteCallback>[0]
  | Parameters<OnErrorCallback>[0]
) & { response: 'success' | 'failure' }

const queue: QueueInput[] = []

app.use(bodyParser.json())

app.get('/:extension', async (req, res) => {
  const extensionKey = req.params.extension
  const extension = extensions.find(({ key }) => key === extensionKey)
  if (extension === undefined) {
    res.status(404).send(`Extension ${extensionKey} not found`)
    return
  }
  res.send(extension)
})

app.post('/:extension/:action', async (req, res) => {
  const extensionKey = req.params.extension
  const actionKey = req.params.action
  const extension = extensions.find(({ key }) => key === extensionKey)
  if (extension === undefined) {
    res.status(404).send(`Extension ${extensionKey} not found`)
    return
  }
  const action = Object.values(extension.actions).find(
    ({ key }) => key === actionKey
  )
  if (action === undefined) {
    res
      .status(404)
      .send(`Action ${actionKey} not found in extension ${extensionKey}`)
    return
  }
  const payload = req.body as NewActivityPayload
  const onCompleteCb = createOnCompleteCallback(payload)
  const onErrorCb = createOnErrorCallback(payload)
  await action
    .onActivityCreated(payload, onCompleteCb, onErrorCb)
    .catch((err) => {
      const error = new AwellError({
        error: err,
        action: actionKey,
        extension: extensionKey,
      })
      void onErrorCb({
        events: [
          {
            text: { en: error.title },
            date: error.date.toISOString(),
            error: {
              category: error.category,
              message: error.message,
            },
          },
        ],
      })
    })
  const result = queue.shift()
  res.send(result)
})

app.listen(port, () => {
  console.log(`Test server listening at http://localhost:${port}`)
})

const createOnCompleteCallback = (
  payload: NewActivityPayload
): OnCompleteCallback => {
  return async (params = {}) => {
    queue.push({ ...params, response: 'success' })
    console.log({ ...params, response: 'success' })
  }
}
const createOnErrorCallback = (
  payload: NewActivityPayload
): OnErrorCallback => {
  return async (params = {}) => {
    queue.push({ ...params, response: 'failure' })
    console.error({ ...params, response: 'failure' })
  }
}
