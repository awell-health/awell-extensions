export const mockPathwayActivitiesResponse = {
  activities: [
    {
      id: 'activity-1',
      date: '2023-01-01T10:00:00.000Z',
      action: 'SCHEDULED',
      status: 'DONE',
      resolution: 'SUCCESS',
      subject: {
        type: 'AWELL',
        name: 'Awell',
        __typename: 'Subject'
      },
      object: {
        type: 'STEP',
        name: 'Step 1',
        __typename: 'Object'
      },
      indirect_object: null,
      form: null,
      track: {
        id: 'test-track-id',
        title: 'Test Track',
        __typename: 'Track'
      },
      context: {
        track_id: 'test-track-id',
        step_id: 'step-1',
        __typename: 'Context'
      },
      __typename: 'Activity'
    },
    {
      id: 'activity-2',
      date: '2023-01-01T11:00:00.000Z',
      action: 'ACTIVATE',
      status: 'DONE',
      resolution: 'SUCCESS',
      subject: {
        type: 'AWELL',
        name: 'Awell',
        __typename: 'Subject'
      },
      object: {
        type: 'STEP',
        name: 'Step 1',
        __typename: 'Object'
      },
      indirect_object: null,
      form: null,
      track: {
        id: 'test-track-id',
        title: 'Test Track',
        __typename: 'Track'
      },
      context: {
        track_id: 'test-track-id',
        step_id: 'step-1',
        __typename: 'Context'
      },
      __typename: 'Activity'
    },
    {
      id: 'activity-3',
      date: '2023-01-01T12:00:00.000Z',
      action: 'ASSIGNED',
      status: 'DONE',
      resolution: 'SUCCESS',
      subject: {
        type: 'AWELL',
        name: 'Awell',
        __typename: 'Subject'
      },
      object: {
        type: 'FORM',
        name: 'Test Form',
        __typename: 'Object'
      },
      indirect_object: null,
      form: {
        id: 'form-1',
        title: 'Test Form',
        __typename: 'Form'
      },
      track: {
        id: 'test-track-id',
        title: 'Test Track',
        __typename: 'Track'
      },
      context: {
        track_id: 'test-track-id',
        step_id: 'step-1',
        __typename: 'Context'
      },
      __typename: 'Activity'
    },
    {
      id: 'activity-4',
      date: '2023-01-03T10:00:00.000Z',
      action: 'SCHEDULED',
      status: 'DONE',
      resolution: 'SUCCESS',
      subject: {
        type: 'AWELL',
        name: 'Awell',
        __typename: 'Subject'
      },
      object: {
        type: 'STEP',
        name: 'Step 2',
        __typename: 'Object'
      },
      indirect_object: null,
      form: null,
      track: {
        id: 'test-track-id',
        title: 'Test Track',
        __typename: 'Track'
      },
      context: {
        track_id: 'test-track-id',
        step_id: 'step-2',
        __typename: 'Context'
      },
      __typename: 'Activity'
    }
  ]
} 