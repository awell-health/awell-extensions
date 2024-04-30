import { type Task } from '@medplum/fhirtypes'

export const mockCreateTaskResponse: Task = {
  resourceType: 'Task',
  code: {
    text: 'Test task',
  },
  description: 'A description goes here',
  status: 'requested',
  intent: 'unknown',
  priority: 'urgent',
  for: {
    reference: 'Patient/5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
  },
  executionPeriod: {
    end: '2024-05-31',
  },
  performerType: [
    {
      text: 'Clinician',
    },
  ],
  requester: {
    identifier: {
      system: 'https://awellhealth.com/activities/',
      value: 'activity-id',
    },
    display: 'Awell',
  },
  id: '2aa23135-8dc4-468f-a410-ac72a4fe6f83',
  meta: {
    versionId: '475d9b84-7d34-49c6-b27d-7534173eb37b',
    lastUpdated: '2024-04-30T15:17:24.812Z',
    author: {
      reference: 'ClientApplication/d8ab9ce8-7c71-41fe-8996-b19dceca2daa',
      display: 'Awell Health Default Client',
    },
    project: 'a9b24c66-fb3f-4162-b94c-cb84e20311e5',
    compartment: [
      {
        reference: 'Project/a9b24c66-fb3f-4162-b94c-cb84e20311e5',
      },
    ],
  },
}
