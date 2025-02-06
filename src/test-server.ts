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
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from 'ioredis'

const app = express()
const port = 3000

app.use(bodyParser.json())

const limiter = Ratelimit.fixedWindow(1, '1m')
const rateLimit = new Ratelimit({
  redis: new Redis({
    host: 'localhost',
    port: 6379,
    password:
      'VRmODJzStDXW0I0fr0G5UXd8v7Az5nJ4MvOMoGVR0iGhQEDuiACJLlNpBkBoyY8RUFhSW8tqt0ojoHIkqCJnLUeLRrmFHO47Og0DYv4wDv1pIfHCVU1uzFZOORNLDRp5',
  }),
  limiter,
})

app.post('/', async (req, res) => {
  console.log(req.body)
  try {
    const { success } = await rateLimit.limit('test')
    if (!success) {
      res.status(429).send('Too many requests')
      return
    }
  } catch (error) {
    console.error(error)
  }
  res.send('ok')
})

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
    ({ key }) => key === actionKey,
  )
  if (action === undefined) {
    res
      .status(404)
      .send(`Action ${actionKey} not found in extension ${extensionKey}`)
    return
  }
  const payload = JSON.parse(req.body.data) as NewActivityPayload
  console.log('incoming', payload)
  const onCompleteCb = createOnCompleteCallback(res)
  const onErrorCb = createOnErrorCallback(res)
  await action.onActivityCreated!(payload, onCompleteCb, onErrorCb).catch(
    (err) => {
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
    },
  )
  // const result = queue.shift()
  // res.send(result)
})

app.listen(port, () => {
  console.log(`Test server listening at http://localhost:${port}`)
})

const createOnCompleteCallback = (
  // payload: NewActivityPayload,
  res: express.Response,
): OnCompleteCallback => {
  return async (params = {}) => {
    console.log({ ...params, response: 'success' })
    res.send({ ...params, response: 'success' })
    // queue.push({ ...params, response: 'success' })
  }
}
const createOnErrorCallback = (
  // payload: NewActivityPayload,
  res: express.Response,
): OnErrorCallback => {
  return async (params = {}) => {
    console.error({ ...params, response: 'failure' })
    res.send({ ...params, response: 'failure' })
    // queue.push({ ...params, response: 'failure' })
  }
}
