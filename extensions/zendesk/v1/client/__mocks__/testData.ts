import { type Task } from '../../types'
import { ResourceType } from '../types'

export const mockedDates = {
  isoDatetime: '2023-08-01T00:00:00Z',
  isoDate: '2023-08-01',
}

export const mockedTaskData: Task = {
  id: 1,
  creator_id: 1,
  owner_id: 1,
  resource_type: ResourceType.LEAD,
  resource_id: 1,
  completed: true,
  completed_at: mockedDates.isoDatetime,
  due_date: mockedDates.isoDatetime,
  overdue: false,
  remind_at: mockedDates.isoDatetime,
  content: 'Contact Tom',
  created_at: mockedDates.isoDatetime,
  updated_at: mockedDates.isoDatetime,
}
