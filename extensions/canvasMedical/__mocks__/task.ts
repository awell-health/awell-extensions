import type { TaskWithId, Task } from '../validation/dto/task.zod'

export const taskData: Task = {
  resourceType: 'Task',
  extension: [
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/task-group',
      valueReference: {
        reference: 'Group/3640cd20de8a470aa570a852859ac87e',
      },
    },
  ],
  status: 'requested',
  requester: {
    reference: 'Practitioner/5eede137ecfe4124b8b773040e33be14',
  },

  description: 'Test title for task from Postman FHIR request',
  for: {
    reference: 'Patient/3640cd20de8a470aa570a852859ac87e',
  },
  owner: { reference: 'Practitioner/3640cd20de8a470aa570a852859ac87e' },
  authoredOn: '2020-01-01T00:00:00Z',
  restriction: {
    period: {
      end: '2020-01-01T00:00:00Z',
    },
  },
  note: [
    {
      authorReference: {
        reference: 'Practitioner/3640cd20de8a470aa570a852859ac87e',
      },
      time: '2020-01-01T00:00:00Z',
      text: 'Let us create a new comment with more fields!',
    },
  ],
  input: [
    {
      type: {
        text: 'label',
      },
      valueString: 'Urgent',
    },
  ],
}

export const taskResource: TaskWithId = {
  id: '31365726-b823-4353-8c91-5d4f59d67ed3',
  ...taskData,
}
