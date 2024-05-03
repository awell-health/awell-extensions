import { type TaskResponse } from '../schema'

export const mockCreateTaskResponse: TaskResponse = {
  id: 'task-id',
  description: 'description',
  status: 'INCOMPLETE',
  createdDateTime: '08:32:17ZT083217Z',
  creator: {
    id: 'someId',
  },
  patient: {
    id: 'someId',
  },
  taskList: {
    id: 'someId',
  },
}
