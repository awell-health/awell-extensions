import type { TaskWithId, Task } from '../validation/dto/task.zod'

export const sampleTaskId: { id: string } = {
  id: '31365726-b823-4353-8c91-5d4f59d67ed3',
}

export const sampleTaskData: Task = {
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
    reference: 'Patient/afd8c6149a6842cfa6017090b4ae330f',
  },
  owner: { reference: 'Practitioner/e766816672f34a5b866771c773e38f3c' },
  authoredOn: '2020-01-01T00:00:00Z',
  restriction: {
    period: {
      end: '2020-01-01T00:00:00Z',
    },
  },
  note: [
    {
      authorReference: {
        reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
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

export const sampleTaskResource: TaskWithId = {
  ...sampleTaskId,
  ...sampleTaskData,
}
