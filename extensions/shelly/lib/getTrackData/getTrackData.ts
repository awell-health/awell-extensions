import { type AwellSdk } from '@awell-health/awell-sdk'

interface GetTrackDataInput {
  awellSdk: AwellSdk
  pathwayId: string
  trackId: string
  currentActivityId: string
}

interface TrackData {
  track: {
    id: string
    title: string
    release_id?: string
    can_trigger_manually?: boolean
  }
  activities: Array<{
    id: string
    date: string
    action: string
    status: string
    subject: {
      type: string
      name: string
    }
    object: {
      id: string
      type: string
      name: string
    }
    indirect_object?: {
      id: string
      type: string
      name: string
    }
    form?: {
      id: string
      title: string
      questions: Array<{
        key: string
        title: string
        questionConfig: {
          mandatory: boolean
        }
      }>
    }
    context?: {
      step_id: string
      track_id: string
    }
    dataPoints?: Array<{
      id: string
      data_set_id: string
      key: string
      serialized_value: string
      data_point_definition_id: string
      date: string
      valueType: string
      activity_id: string
    }>
  }>
  steps: Array<{
    id: string
    parent_id?: string
    name: string
    label: string
    start_date?: string
    status: string
    stakeholders?: Array<{
      id: string
      name: string
    }>
    context?: {
      instance_id: string
      pathway_id: string
      step_id: string
      track_id: string
    }
    activities: string[] // Array of activity IDs in this step
  }>
  decisionPath: {
    steps: Array<{
      stepId: string
      condition?: string
      outcome: string
      label: string
    }>
  }
}

interface TrackQueryResponse {
  pathway: {
    code: string;
    success: boolean;
    pathway: {
      tracks: Array<{
        id: string
        title: string
        release_id: string
        can_trigger_manually: boolean
      }>
    }
  }
}

interface ActivitiesQueryResponse {
  pathwayActivities: {
    activities: Array<{
      id: string
      date: string
      action: string
      status: string
      subject: {
        type: string
        name: string
      }
      object: {
        id: string
        type: string
        name: string
      }
      indirect_object?: {
        id: string
        type: string
        name: string
      }
      form?: {
        id: string
        title: string
        questions: Array<{
          key: string
          title: string
          questionConfig: {
            mandatory: boolean
          }
        }>
      }
      context?: {
        step_id: string
        track_id: string
      }
    }>
  }
}

interface DataPointsQueryResponse {
  pathwayDataPoints: {
    code: string;
    success: boolean;
    pagination?: {
      count: number;
      offset: number;
      total_count: number;
    };
    sorting?: {
      direction: string;
      field: string;
    };
    dataPoints: Array<{
      id: string
      data_set_id: string
      key: string
      serialized_value: string
      data_point_definition_id: string
      date: string
      valueType: string
      activity_id: string
    }>;
  }
}

export const getTrackData = async ({
  awellSdk,
  pathwayId,
  trackId,
  currentActivityId,
}: GetTrackDataInput): Promise<TrackData> => {
  // 1. Get track details with steps and decision path
  const trackQuery = (await awellSdk.orchestration.query({
    pathway: {
      __args: {
        id: pathwayId,
      },
      code: true,
      success: true,
      pathway: {
        tracks: {
          id: true,
          title: true,
          release_id: true,
          can_trigger_manually: true,
        },
      },
    },
  })) as TrackQueryResponse

  // 2. Get all activities in the track up to current activity
  const activitiesQuery = (await awellSdk.orchestration.query({
    pathwayActivities: {
      __args: {
        pathway_id: pathwayId,
        pagination: { offset: 0, count: 500 }, // Get up to 500 activities
        sorting: {
          direction: 'asc',
          field: 'date',
        },
      },
      activities: {
        id: true,
        date: true,
        action: true,
        status: true,
        subject: {
          type: true,
          name: true,
        },
        object: {
          id: true,
          type: true,
          name: true,
        },
        indirect_object: {
          id: true,
          type: true,
          name: true,
        },
        form: {
          id: true,
          title: true,
          questions: {
            key: true,
            title: true,
            questionConfig: {
              mandatory: true,
            },
          },
        },
        context: {
          step_id: true,
          track_id: true,
        },
      },
    },
  })) as ActivitiesQueryResponse

  // 3. Get data points for all activities in the track
  const dataPointsQuery = (await awellSdk.orchestration.query({
    pathwayDataPoints: {
      __args: {
        pathway_id: pathwayId,
      },
      code: true,
      success: true,
      dataPoints: {
        id: true,
        data_set_id: true,
        key: true,
        serialized_value: true,
        data_point_definition_id: true,
        date: true,
        valueType: true,
        activity_id: true,
      },
    },
  })) as DataPointsQueryResponse

  // 4. Filter activities to only include those in the current track up to current activity
  const currentActivity = activitiesQuery.pathwayActivities.activities.find(a => a.id === currentActivityId)
  const currentActivityDate = currentActivity?.date ?? ''
  
  const trackActivities = activitiesQuery.pathwayActivities.activities
    .filter(activity => 
      (activity.context?.track_id === trackId) && 
      (activity.date <= currentActivityDate)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 5. Add data points to activities
  const activitiesWithDataPoints = trackActivities.map(activity => ({
    ...activity,
    dataPoints: dataPointsQuery.pathwayDataPoints.dataPoints.filter(
      dataPoint => dataPoint.activity_id === activity.id
    ),
  }))

  // 6. Group activities by step
  const steps: Array<{
    id: string
    parent_id?: string
    name: string
    label: string
    start_date?: string
    status: string
    stakeholders?: Array<{
      id: string
      name: string
    }>
    context?: {
      instance_id: string
      pathway_id: string
      step_id: string
      track_id: string
    }
  }> = [] // We'll need to get steps from a different query
  const stepsWithActivities = steps.map(step => ({
    ...step,
    activities: activitiesWithDataPoints
      .filter(activity => activity.context?.step_id === step.id)
      .map(activity => activity.id),
  }))

  const track = trackQuery.pathway.pathway.tracks.find(t => t.id === trackId) ?? {
    id: trackId,
    title: '',
    release_id: '',
    can_trigger_manually: false,
  }

  return {
    track,
    activities: activitiesWithDataPoints,
    steps: stepsWithActivities,
    decisionPath: { steps: [] }, // We'll need to get decision path from a different query
  }
} 