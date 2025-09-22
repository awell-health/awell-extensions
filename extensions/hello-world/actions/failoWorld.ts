import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'

const fields = {
  failureAttempts: {
    id: 'failureAttempts',
    label: 'Number of attempts that should fail',
    description:
      'Specify how many attempts should fail before the action succeeds',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  currentAttempt: {
    key: 'currentAttempt',
    valueType: 'number',
  },
  result: {
    key: 'result',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const failoWorld: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'test-retry',
  category: Category.DEMO,
  title: 'Fail-o World',
  description:
    'A test action that fails for a specified number of attempts to test the automated retry mechanism.',
  fields,
  previewable: false,
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, attempt }): Promise<void> => {
    const { fields } = payload
    const failureAttempts = Number(fields.failureAttempts)

    if (attempt <= failureAttempts) {
      // This attempt should fail
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Attempt ${attempt} of ${failureAttempts} - Intentionally failing for testing retry mechanism`,
            },
            error: {
              category: 'SERVER_ERROR',
              message: `This is intentional failure #${attempt}`,
            },
          },
        ],
      })
      return
    }

    // This attempt should succeed
    await onComplete({
      data_points: {
        currentAttempt: String(attempt),
        result: `Success on attempt ${attempt} after ${failureAttempts} failures`,
      },
    })
  },
}
