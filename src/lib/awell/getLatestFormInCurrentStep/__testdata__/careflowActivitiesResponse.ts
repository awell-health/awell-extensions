import {
  type ActivityPayload,
  type ActivitiesPayload,
} from '@awell-health/awell-sdk'
import { type DeepPartial } from '../../../types'
import { subDays } from 'date-fns'

const today = new Date()
const stepId = 'Xkn5dkyPA5uW'

export const mockCurrentActivityResponse = {
  success: true,
  activity: {
    id: 'X74HeDQ4N0gtdaSEuzF8s',
    status: 'ACTIVE',
    date: today.toISOString(),
    object: {
      id: 'w1EgLnVu5ApP',
      type: 'PLUGIN_ACTION',
    },
    context: {
      step_id: stepId,
    },
  },
} satisfies DeepPartial<ActivityPayload>

export const mockPathwayStepActivitiesResponse = {
  success: true,
  activities: [
    { ...mockCurrentActivityResponse.activity },
    {
      id: 'RhRQqdbrnSptV3twx7QtV',
      status: 'DONE',
      date: subDays(today, 1).toISOString(),
      object: {
        id: 'OGhjJKF5LRmo',
        type: 'FORM',
      },
      context: {
        step_id: stepId,
      },
    },
    {
      id: 'shkMEWqOzHQMsYrGS6yId',
      status: 'DONE',
      date: subDays(today, 2).toISOString(),
      object: {
        id: 'Q3KUacz4qEmn',
        type: 'STEP',
      },
      context: {
        step_id: stepId,
      },
    },
    {
      id: 'f2IjXGjg7YoHZ7lEF0l5j',
      status: 'DONE',
      date: subDays(today, 3).toISOString(),
      object: {
        id: 'Q3KUacz4qEmn',
        type: 'STEP',
      },
      context: {
        step_id: stepId,
      },
    },
  ],
} satisfies DeepPartial<ActivitiesPayload>

/**
 * Mock data with multiple form activities in ASCENDING order (oldest first).
 * This tests that the sorting logic correctly returns the most recent form.
 */
export const mockPathwayStepActivitiesWithMultipleFormsResponse = {
  success: true,
  activities: [
    { ...mockCurrentActivityResponse.activity },
    // Oldest form - 3 days ago (listed FIRST to test sorting)
    {
      id: 'oldestFormActivityId',
      status: 'DONE',
      date: subDays(today, 3).toISOString(),
      object: {
        id: 'oldestFormId',
        name: 'Oldest Form',
        type: 'FORM',
      },
      context: {
        step_id: stepId,
      },
    },
    // Middle form - 2 days ago
    {
      id: 'middleFormActivityId',
      status: 'DONE',
      date: subDays(today, 2).toISOString(),
      object: {
        id: 'middleFormId',
        name: 'Middle Form',
        type: 'FORM',
      },
      context: {
        step_id: stepId,
      },
    },
    // Most recent form - 1 day ago (listed LAST to test sorting)
    {
      id: 'latestFormActivityId',
      status: 'DONE',
      date: subDays(today, 1).toISOString(),
      object: {
        id: 'latestFormId',
        name: 'Latest Form',
        type: 'FORM',
      },
      context: {
        step_id: stepId,
      },
    },
  ],
} satisfies DeepPartial<ActivitiesPayload>
