export const mockPathwayDataPointsResponse = {
  dataPoints: [
    {
      id: 'data-point-1',
      data_set_id: 'dataset-1',
      key: 'activation-date',
      serialized_value: '2023-01-01T10:00:00.000Z',
      data_point_definition_id: 'step-1-ACTIVATION',
      date: '2023-01-01T10:00:00.000Z',
      valueType: 'DATE',
      activity_id: 'activity-1',
      __typename: 'DataPoint'
    },
    {
      id: 'data-point-2',
      data_set_id: 'dataset-1',
      key: 'completion-date',
      serialized_value: '2023-01-02T10:00:00.000Z',
      data_point_definition_id: 'step-1-COMPLETION',
      date: '2023-01-02T10:00:00.000Z',
      valueType: 'DATE',
      activity_id: 'activity-2',
      __typename: 'DataPoint'
    },
    {
      id: 'data-point-3',
      data_set_id: 'dataset-2',
      key: 'form-response',
      serialized_value: 'Test response',
      data_point_definition_id: 'form-response-1',
      date: '2023-01-01T12:00:00.000Z',
      valueType: 'STRING',
      activity_id: 'activity-3',
      __typename: 'DataPoint'
    }
  ]
} 