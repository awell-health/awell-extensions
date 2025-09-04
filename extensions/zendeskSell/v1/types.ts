import { type ResourceType } from './client/types'

export interface Task {
  id: number
  creator_id: number
  owner_id: number
  resource_type?: ResourceType
  resource_id?: number
  completed: boolean
  completed_at?: string
  due_date?: string
  overdue: boolean
  remind_at?: string
  content: string
  created_at: string
  updated_at?: string
}

export interface TaskInput
  extends Pick<Required<Task>, 'content'>,
    Pick<
      Partial<Task>,
      | 'due_date'
      | 'owner_id'
      | 'resource_type'
      | 'resource_id'
      | 'completed'
      | 'remind_at'
    > {}
