import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'

const fields = {
  hello: {
    id: 'hello',
    label: 'Hello',
    description: 'A string field configured at design time',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  world: {
    key: 'world',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const logTwo: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'log-two',
  category: Category.DEMO,
  title: 'Log a second time',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing world')

    try {
      const { fields } = payload
      await onComplete({
        data_points: {
          world: fields.hello,
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
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
    }
  },
}
