import { type Task, ResourceType } from '../../types'

export const mockedDates = {
  iso: '2023-08-01T00:00:00Z',
}

export const mockedTaskData: Task = {
  id: 1,
  creator_id: 1,
  owner_id: 1,
  resource_type: ResourceType.LEAD,
  resource_id: 1,
  completed: true,
  completed_at: mockedDates.iso,
  due_date: mockedDates.iso,
  overdue: false,
  remind_at: mockedDates.iso,
  content: 'Contact Tom',
  created_at: mockedDates.iso,
  updated_at: mockedDates.iso,
}
