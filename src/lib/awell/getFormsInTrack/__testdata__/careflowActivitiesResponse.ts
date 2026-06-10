export const mockTrackActivitiesResponse = {
  success: true,
  activities: [
    // Non-form activities should be filtered out
    {
      id: 'step_activity',
      status: 'DONE',
      date: '2024-09-11T22:56:07.000Z',
      object: {
        id: 'step_1',
        name: 'Some Step',
        type: 'STEP',
      },
    },
    // Note: form_activity_2 appears BEFORE form_activity_1 in the array,
    // but has a LATER date — tests that ascending sort returns form_activity_1 first
    {
      id: 'form_activity_2',
      status: 'DONE',
      date: '2024-09-11T22:56:10.000Z', // Later (newer)
      object: {
        id: 'form_2',
        name: 'Intake Form',
        type: 'FORM',
      },
    },
    {
      id: 'form_activity_1',
      status: 'DONE',
      date: '2024-09-11T22:56:08.315Z', // Earlier (older)
      object: {
        id: 'form_1',
        name: 'Screening Form',
        type: 'FORM',
      },
    },
    // A form that is not DONE should be filtered out
    {
      id: 'form_activity_3',
      status: 'ACTIVE',
      date: '2024-09-11T22:56:05.000Z',
      object: {
        id: 'form_3',
        name: 'Pending Form',
        type: 'FORM',
      },
    },
    // A form with a date after the current activity should be filtered out
    {
      id: 'form_activity_future',
      status: 'DONE',
      date: '2024-09-11T23:00:00.000Z', // After current activity date
      object: {
        id: 'form_future',
        name: 'Future Form',
        type: 'FORM',
      },
    },
  ],
}
