import {
  type ActivityPayload,
  type ActivitiesPayload,
} from '@awell-health/awell-sdk'
import { subDays } from 'date-fns'
import { type DeepPartial } from '../../../types'

const today = new Date()
const stepId = 'step_a'

export const mockCurrentActivityResponse = {
  success: true,
  activity: {
    status: 'ACTIVE',
    date: today.toISOString(),
    object: {
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
      id: 'calculation_two',
      status: 'DONE',
      date: subDays(today, 1).toISOString(),
      object: {
        id: 'calculation_two',
        type: 'CALCULATION',
      },
      context: {
        step_id: 'step_a',
      },
    },
    {
      id: 'calculation_one',
      status: 'DONE',
      date: subDays(today, 2).toISOString(),
      object: {
        id: 'calculation_one',
        type: 'CALCULATION',
      },
      context: {
        step_id: stepId,
      },
    },
    {
      id: 'form',
      status: 'DONE',
      date: subDays(today, 3).toISOString(),
      object: {
        type: 'FORM',
      },
      context: {
        step_id: stepId,
      },
    },
  ],
} satisfies DeepPartial<ActivitiesPayload>
