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
  secondField: {
    id: 'secondField',
    label: 'Second Field',
    description: 'A second field',
    required: false,
    type: FieldType.STRING,
  },
  thirdField: {
    id: 'thirdField',
    label: 'Third Field',
    description: 'A third field',
    required: false,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

const dataPoints = {
  world: {
    key: 'world',
    valueType: 'string',
  },
  clear: {
    key: 'clear',
    valueType: 'string',
  },
  secret: {
    key: 'secret',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const log: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'log',
  category: Category.DEMO,
  title: 'Log hello world',
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
      const { fields, settings } = payload
      await onComplete({
        data_points: {
          world: fields.hello,
          clear: settings.clear,
          secret: settings.secret,
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
