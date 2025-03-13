export const mockPathwayElementsResponse = {
  elements: [
    {
      id: 'step-1',
      name: 'Step 1',
      label: {
        text: 'First Step',
        __typename: 'Label'
      },
      start_date: '2023-01-01T00:00:00.000Z',
      end_date: '2023-01-02T00:00:00.000Z',
      status: 'DONE',
      type: 'STEP',
      stakeholders: [
        {
          name: 'Test Doctor',
          __typename: 'Stakeholder'
        }
      ],
      context: {
        step_id: 'step-1',
        track_id: 'test-track-id',
        __typename: 'Context'
      },
      __typename: 'Element'
    },
    {
      id: 'step-2',
      name: 'Step 2',
      label: {
        text: 'Second Step',
        __typename: 'Label'
      },
      start_date: '2023-01-03T00:00:00.000Z',
      end_date: '2023-01-04T00:00:00.000Z',
      status: 'ACTIVE',
      type: 'STEP',
      stakeholders: [],
      context: {
        step_id: 'step-2',
        track_id: 'test-track-id',
        __typename: 'Context'
      },
      __typename: 'Element'
    }
  ]
} 