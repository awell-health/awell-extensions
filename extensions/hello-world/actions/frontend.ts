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

export const frontend: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'frontend',
  category: Category.FORMS,
  title: 'Frontend',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: false,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  dataPoints,
  onEvent: async ({ payload, helpers: { log } }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    log({ meta, payload }, 'Frontend payload')
  },
}
