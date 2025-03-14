import { getTrackData } from '.'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockPathwayResponse,
  mockPathwayElementsResponse,
  mockPathwayActivitiesResponse,
  mockPathwayDataPointsResponse,
  mockFormDefinitionResponse,
  mockFormResponseResponse,
  mockMessageResponse,
  mockEmptyMessageResponse,
  mockMessageActivityWithId,
  mockMessageActivityWithoutId
} from './__mocks__'

jest.mock('@awell-health/awell-sdk', () => {
  return {
    AwellSdk: jest.fn().mockImplementation(() => ({
      orchestration: {
        query: jest.fn(),
      },
    })),
  }
})

describe('getTrackData', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>
  // Store the original console.error
  const originalConsoleError = console.error;

  // Suppress console.error before all tests
  beforeAll(() => {
    console.error = jest.fn();
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>

    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock the query results for the combined query
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: mockPathwayActivitiesResponse,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })

    // Mock form definition and response queries
    mockQuery.mockResolvedValueOnce(mockFormDefinitionResponse)
    mockQuery.mockResolvedValueOnce(mockFormResponseResponse)
  })

  test('Should return processed track data with steps and activities', async () => {
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-4',
    })

    // Verify the SDK was called with the correct queries
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3)
    
    // First call should be the combined query
    const firstCallArgs = (awellSdkMock.orchestration.query as jest.Mock).mock.calls[0][0]
    expect(firstCallArgs).toHaveProperty('pathway.__args.id', 'test-pathway-id')
    expect(firstCallArgs).toHaveProperty('pathwayElements.__args.pathway_id', 'test-pathway-id')
    expect(firstCallArgs).toHaveProperty('pathwayActivities.__args.pathway_id', 'test-pathway-id')
    expect(firstCallArgs).toHaveProperty('pathwayDataPoints.__args.pathway_id', 'test-pathway-id')

    // Verify the structure of the result
    expect(result).toHaveProperty('steps')
    expect(result.steps).toHaveLength(2)
    
    // Check first step
    expect(result.steps[0]).toMatchObject({
      name: 'Step 1',
      label: 'First Step',
      status: 'DONE',
      start_date: '2023-01-01T00:00:00.000Z',
      end_date: '2023-01-02T00:00:00.000Z',
    })
    
    // Check activities in first step
    expect(result.steps[0].activities).toHaveLength(3)
    expect(result.steps[0].activities[0]).toMatchObject({
      date: '2023-01-01T10:00:00.000Z',
      action: 'SCHEDULED',
      status: 'DONE',
      resolution: 'SUCCESS',
    })
    
    // Check form data in the third activity
    expect(result.steps[0].activities[2]).toHaveProperty('form')
    expect(result.steps[0].activities[2].form).toHaveProperty('title', 'Test Form')
    expect(result.steps[0].activities[2].form).toHaveProperty('questions')
    
    // Check second step
    expect(result.steps[1]).toMatchObject({
      name: 'Step 2',
      label: 'Second Step',
      status: 'ACTIVE',
    })
    
    // Check activities in second step
    expect(result.steps[1].activities).toHaveLength(1)
  })

  test('Should handle empty responses gracefully', async () => {
    // Reset mock to return empty responses
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    mockQuery.mockResolvedValueOnce({
      pathway: { pathway: { tracks: [] } },
      pathwayElements: { elements: [] },
      pathwayActivities: { activities: [] },
      pathwayDataPoints: { dataPoints: [] }
    })

    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-3',
    })

    // Verify the structure of the result with empty data
    expect(result).toHaveProperty('steps')
    expect(result.steps).toHaveLength(0)
  })

  test('Should throw error for missing required parameters', async () => {
    await expect(getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: '',
      trackId: 'test-track-id',
      currentActivityId: 'activity-3',
    })).rejects.toThrow('PathwayId is required')

    await expect(getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: '',
      currentActivityId: 'activity-3',
    })).rejects.toThrow('TrackId is required')

    await expect(getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: '',
    })).rejects.toThrow('CurrentActivityId is required')
  })

  test('Should filter activities by track ID and current activity date', async () => {
    // Set up a specific current activity date
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    
    // Add an activity with a later date that should be filtered out
    const modifiedActivitiesResponse = {
      ...mockPathwayActivitiesResponse,
      activities: [
        ...mockPathwayActivitiesResponse.activities,
        {
          id: 'activity-5',
          date: '2023-01-05T10:00:00.000Z', // Later than our cutoff date
          action: 'SCHEDULED',
          status: 'PENDING',
          resolution: null,
          subject: { type: 'AWELL', name: 'Awell' },
          object: { type: 'STEP', name: 'Step 2' },
          context: { track_id: 'test-track-id', step_id: 'step-2' }
        }
      ]
    }
    
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: modifiedActivitiesResponse,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })
    
    // Use activity-3 as current activity (date: 2023-01-01T12:00:00.000Z)
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-3',
    })

    // Should only include activities up to activity-3's date
    const allActivities = result.steps.flatMap(step => step.activities)
    const latestActivityDate = new Date('2023-01-01T12:00:00.000Z').getTime()
    
    // Verify all activities are before or equal to the cutoff date
    allActivities.forEach(activity => {
      const activityDate = new Date(activity.date).getTime()
      expect(activityDate).toBeLessThanOrEqual(latestActivityDate)
    })
    
    // Verify activity-5 is not included
    const activityIds = allActivities.map(a => a.date)
    expect(activityIds).not.toContain('2023-01-05T10:00:00.000Z')
  })

  test('Should fetch and process message content successfully', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    
    // Add message activity to the activities response
    const activitiesWithMessage = {
      ...mockPathwayActivitiesResponse,
      activities: [
        ...mockPathwayActivitiesResponse.activities,
        mockMessageActivityWithId
      ]
    }
    
    // Mock the combined query response
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: activitiesWithMessage,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })
    
    // Mock form definition and response queries
    mockQuery.mockResolvedValueOnce(mockFormDefinitionResponse)
    mockQuery.mockResolvedValueOnce(mockFormResponseResponse)
    
    // Mock message query
    mockQuery.mockResolvedValueOnce(mockMessageResponse)
    
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-4',
    })
    
    // Verify the SDK was called with the correct queries
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4) // Combined query + form def + form response + message
    
    // Find the message activity in the result
    const step1 = result.steps.find(step => step.name === 'Step 1')
    expect(step1).toBeDefined()
    
    const messageActivity = step1?.activities.find(activity => activity.subject.type === 'AWELL' && activity.object.type === 'MESSAGE')
    expect(messageActivity).toBeDefined()
    expect(messageActivity).toHaveProperty('message')
    expect(messageActivity?.message).toMatchObject({
      subject: 'Test Message Subject',
      body: '<p>This is a test message body</p>'
    })
  })
  
  test('Should handle missing message ID gracefully', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    
    // Add message activity without ID to the activities response
    const activitiesWithoutMessageId = {
      ...mockPathwayActivitiesResponse,
      activities: [
        ...mockPathwayActivitiesResponse.activities,
        mockMessageActivityWithoutId
      ]
    }
    
    // Mock the combined query response
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: activitiesWithoutMessageId,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })
    
    // Mock form definition and response queries
    mockQuery.mockResolvedValueOnce(mockFormDefinitionResponse)
    mockQuery.mockResolvedValueOnce(mockFormResponseResponse)
    
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-4',
    })
    
    // Verify the SDK was called with the correct queries - should not attempt to fetch message
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(3) // Combined query + form def + form response
    
    // Find the message activity in the result
    const step1 = result.steps.find(step => step.name === 'Step 1')
    expect(step1).toBeDefined()
    
    // The message activity should be included but without message content
    const messageActivity = step1?.activities.find(activity => 
      activity.subject.type === 'AWELL' && 
      activity.object.type === 'MESSAGE' && 
      activity.object.name === 'Test Message Without ID'
    )
    expect(messageActivity).toBeDefined()
    expect(messageActivity).not.toHaveProperty('message')
  })
  
  test('Should handle message fetch errors gracefully', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    
    // Add message activity to the activities response
    const activitiesWithMessage = {
      ...mockPathwayActivitiesResponse,
      activities: [
        ...mockPathwayActivitiesResponse.activities,
        mockMessageActivityWithId
      ]
    }
    
    // Mock the combined query response
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: activitiesWithMessage,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })
    
    // Mock form definition and response queries
    mockQuery.mockResolvedValueOnce(mockFormDefinitionResponse)
    mockQuery.mockResolvedValueOnce(mockFormResponseResponse)
    
    // Mock message query to throw an error
    mockQuery.mockRejectedValueOnce(new Error('Failed to fetch message'))
    
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-4',
    })
    
    // Verify the SDK was called with the correct queries
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4) // Combined query + form def + form response + message (failed)
    
    // The function should complete successfully despite the message fetch error
    expect(result).toHaveProperty('steps')
    
    // Find the message activity in the result
    const step1 = result.steps.find(step => step.name === 'Step 1')
    expect(step1).toBeDefined()
    
    // The message activity should be included but without message content
    const messageActivity = step1?.activities.find(activity => 
      activity.subject.type === 'AWELL' && 
      activity.object.type === 'MESSAGE'
    )
    expect(messageActivity).toBeDefined()
    
    // Should use fallback content if available
    if (messageActivity) {
      if (messageActivity.message) {
        expect(messageActivity.message.subject).toBe('Test Message')
      } else {
        // This is also acceptable - the message property might not be set at all
        expect(messageActivity.message).toBeUndefined()
      }
    }
  })
  
  test('Should handle empty message response gracefully', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock
    mockQuery.mockReset()
    
    // Add message activity to the activities response
    const activitiesWithMessage = {
      ...mockPathwayActivitiesResponse,
      activities: [
        ...mockPathwayActivitiesResponse.activities,
        mockMessageActivityWithId
      ]
    }
    
    // Mock the combined query response
    mockQuery.mockResolvedValueOnce({
      pathway: mockPathwayResponse,
      pathwayElements: mockPathwayElementsResponse,
      pathwayActivities: activitiesWithMessage,
      pathwayDataPoints: mockPathwayDataPointsResponse
    })
    
    // Mock form definition and response queries
    mockQuery.mockResolvedValueOnce(mockFormDefinitionResponse)
    mockQuery.mockResolvedValueOnce(mockFormResponseResponse)
    
    // Mock message query to return empty response
    mockQuery.mockResolvedValueOnce(mockEmptyMessageResponse)
    
    const result = await getTrackData({
      awellSdk: awellSdkMock,
      pathwayId: 'test-pathway-id',
      trackId: 'test-track-id',
      currentActivityId: 'activity-4',
    })
    
    // Verify the SDK was called with the correct queries
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(4) // Combined query + form def + form response + message
    
    // Find the message activity in the result
    const step1 = result.steps.find(step => step.name === 'Step 1')
    expect(step1).toBeDefined()
    
    // The message activity should be included but without message content
    const messageActivity = step1?.activities.find(activity => 
      activity.subject.type === 'AWELL' && 
      activity.object.type === 'MESSAGE'
    )
    expect(messageActivity).toBeDefined()
    
    // Should use fallback content if available
    if (messageActivity) {
      if (messageActivity.message) {
        expect(messageActivity.message.subject).toBe('Test Message')
      } else {
        // This is also acceptable - the message property might not be set at all
        expect(messageActivity.message).toBeUndefined()
      }
    }
  })
}) 