import { AxiosError } from 'axios'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { makeExamplePartnerAPIClient } from '../exampleClient'
import { type settings as Settings } from '../settings'

const fields = {
  hello: {
    id: 'hello',
    label: 'Hello',
    description: 'A string field configured at design time.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const FieldSchema = z.object({
  hello: z.string().optional(),
})

const dataPoints = {
  world: {
    key: 'world',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const hello: Action<
  typeof fields,
  typeof Settings,
  keyof typeof dataPoints
> = {
  key: 'hello',
  category: Category.DEMO,
  title: 'Hello',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    // We validate the fields using zod
    const { hello } = FieldSchema.parse(fields)

    // make the client using our client credentials settings
    // (validation takes place inside the ctor)
    try {
      const client = makeExamplePartnerAPIClient(settings)

      // call our fake endpoint
      const world = await client.hello(hello)

      // we return the response from the endpoint as a datapoint (also a string)
      await onComplete({
        data_points: {
          world,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'SERVER_ERROR',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'BAD_REQUEST',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
