export enum ResourceType {
  LEAD = 'lead',
  CONTACT = 'contact',
  DEAL = 'deal',
}

export interface Task {
  id: number
  creator_id: number
  owner_id: number
  resource_type?: ResourceType.CONTACT | ResourceType.DEAL | ResourceType.LEAD
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