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
    title?: string
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
    action_component?: {
      title: string
      definition_id: string
      release_id: string
    }
    dataPoints?: Array<{
      id: string
      key: string
      serialized_value: string
      data_point_definition_id: string
      date: string
      valueType: string
      activity_id: string
      definitionKey?: string
      definitionTitle?: string
    }>
  }>
  steps: Array<{
    id: string
    name: string
    label: string
    start_date?: string
    end_date?: string
    status: string
    activity_type?: string
    stakeholders?: Array<{
      id: string
      name: string
    }>
    activities: string[]
  }>
}

interface TrackQueryResponse {
  pathway: {
    code: string;
    success: boolean;
    pathway: {
      id: string;
      title: string;
      pathway_definition_id: string;
      tracks: Array<{
        id: string
        title: string
      }>
    }
  }
}

interface ElementsQueryResponse {
  pathwayElements: {
    code: string;
    success: boolean;
    elements: Array<{
      id: string
      parent_id?: string
      name: string
      label?: {
        text: string
        color: string
        id?: string
      }
      start_date: string
      end_date?: string
      status: string
      type: string
      activity_type?: string
      stakeholders: Array<{
        id: string
        name?: string
      }>
      context: {
        instance_id: string
        pathway_id: string
        step_id: string
        track_id: string
      }
    }>
  }
}

interface ActivityNode {
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
  track?: {
    id: string
    title: string
  }
  context?: {
    instance_id: string
    pathway_id: string
    track_id: string
    step_id: string
    action_id: string
  }
  stakeholders?: Array<{
    type: string
    id: string
    name: string
  }>
  resolution?: string
  stream_id?: string
  dataPoints?: Array<{
    id: string
    data_set_id: string
    key: string
    serialized_value: string
    data_point_definition_id: string
    date: string
    valueType: string
    activity_id: string
    definitionKey?: string
    definitionTitle?: string
  }>
}

interface ActivitiesResponse {
  pathwayActivities: {
    success: boolean
    activities: ActivityNode[]
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

interface CleanActivity {
  date: string
  action: string
  status: string
  subject: {
    type: string
    name: string
  }
  object: {
    type: string
    name: string
  }
  indirect_object?: {
    type: string
    name: string
  }
  form?: {
    title: string
    questions: Array<{
      title: string
      response?: string
    }>
  }
  data_points?: Array<{
    value: string
    title?: string
    date: string
  }>
}

interface CleanTrackData {
  track: {
    title: string
    status?: string
  }
  steps: Array<{
    name: string
    label: string
    status: string
    start_date?: string
    end_date?: string
    stakeholders?: Array<{
      name: string
    }>
    activities: CleanActivity[]
  }>
}

export interface GetTrackDataOutput {
  track: {
    title: string
    status?: string
  }
  steps: Array<{
    name: string
    label: string
    status: string
    start_date?: string
    end_date?: string
    stakeholders?: Array<{
      name: string
    }>
    activities: Array<{
      date: string
      action: string
      status: string
      subject: {
        type: string
        name: string
      }
      object: {
        type: string
        name: string
      }
      indirect_object?: {
        type: string
        name: string
      }
      form?: {
        title: string
        questions: Array<{
          title: string
          response?: string
        }>
      }
      data_points?: Array<{
        value: string
        title?: string
        date: string
      }>
    }>
  }>
}

const cleanDataForLLM = async (
  data: TrackData,
  awellSdk: AwellSdk,
  pathwayId: string
): Promise<CleanTrackData> => {
  return {
    track: {
      title: data.track.title ?? 'Untitled Track',
    },
    steps: await Promise.all(data.steps.map(async step => {
      const stepActivities = data.activities.filter(
        activity => activity.context?.step_id === step.id
      )

      return {
        name: step.name,
        label: step.label,
        status: step.status,
        start_date: step.start_date,
        end_date: step.end_date,
        stakeholders: step.stakeholders?.map(s => ({
          name: s.name
        })),
        activities: await Promise.all(stepActivities.map(async activity => {
          const baseActivity: Partial<CleanActivity> = {
            date: activity.date,
            action: activity.action,
            status: activity.status,
            subject: {
              type: activity.subject.type,
              name: activity.subject.name
            },
            object: {
              type: activity.object.type,
              name: activity.object.name
            }
          }

          if (activity.indirect_object?.type !== undefined && activity.indirect_object?.name !== undefined) {
            baseActivity.indirect_object = {
              type: activity.indirect_object.type,
              name: activity.indirect_object.name
            }
          }

          // Process form data if available
          const formId = activity.form?.id;
          const formTitle = activity.form?.title;
          
          if (formId !== undefined && 
              formId !== '' &&
              formTitle !== undefined && 
              formTitle !== '') {
            try {
              // Get form definition using SDK
              const formDefinitionResponse = await awellSdk.orchestration.query({
                form: {
                  __args: {
                    id: formId,
                    pathway_id: pathwayId,
                  },
                  form: {
                    id: true,
                    title: true,
                    key: true,
                    definition_id: true,
                    release_id: true,
                    questions: {
                      id: true,
                      key: true,
                      title: true,
                      userQuestionType: true,
                      options: {
                        label: true,
                        value: true,
                        value_string: true,
                      },
                    },
                  },
                },
              });

              // Get form response using SDK
              const formResponseData = await awellSdk.orchestration.query({
                formResponse: {
                  __args: {
                    pathway_id: pathwayId,
                    activity_id: activity.id,
                  },
                  response: {
                    answers: {
                      question_id: true,
                      value: true,
                      label: true,
                      value_type: true,
                    },
                  },
                },
              });

              const formDefinition = formDefinitionResponse.form?.form;
              const formResponse = formResponseData.formResponse?.response;

              if (formDefinition !== null && formResponse !== null) {
                // Map questions to their answers
                const formattedResponses = formDefinition.questions.map(question => {
                  const answer = formResponse.answers.find(a => a.question_id === question.id);
                  let responseText = answer?.value ?? 'No response';

                  // Handle different question types
                  if (question.userQuestionType === 'YES_NO') {
                    responseText = responseText === '1' ? 'Yes' : responseText === '0' ? 'No' : 'No response';
                  } else if (question.userQuestionType === 'MULTIPLE_CHOICE' && answer !== null) {
                    const option = question.options?.find(opt => opt.value_string === answer?.value);
                    responseText = option?.label ?? responseText;
                  }

                  return {
                    title: question.title,
                    response: responseText
                  };
                });

                baseActivity.form = {
                  title: formTitle,
                  questions: formattedResponses
                };
              }
            } catch (error) {
              // Fallback to basic form data if form questions exist
              const questions = activity.form?.questions;
              if (Array.isArray(questions)) {
                baseActivity.form = {
                  title: formTitle,
                  questions: questions.map(q => ({
                    title: q.title,
                    response: 'No response'
                  }))
                };
              }
            }
          } 
          // Handle standalone data points
          else if (Array.isArray(activity.dataPoints) && activity.dataPoints.length > 0) {
            baseActivity.data_points = activity.dataPoints.map(dp => ({
              value: dp.serialized_value,
              date: dp.date,
              title: dp.definitionTitle
            }));
          }

          return baseActivity as CleanActivity
        }))
      }
    }))
  }
}

export const getTrackData = async ({
  awellSdk,
  pathwayId,
  trackId,
  currentActivityId,
}: GetTrackDataInput): Promise<GetTrackDataOutput> => {
  // 1. Query pathway to get track information
  const pathwayQuery = await awellSdk.orchestration.query({
    pathway: {
      __args: {
        id: pathwayId,
      },
      code: true,
      success: true,
      pathway: {
        id: true,
        title: true,
        pathway_definition_id: true,
        tracks: {
          id: true,
          title: true,
          release_id: true,
          can_trigger_manually: true,
        },
      },
    },
  }) as unknown as TrackQueryResponse;

  // 2. Get pathway elements (steps)
  const elementsQuery = (await awellSdk.orchestration.query({
    pathwayElements: {
      __args: {
        pathway_id: pathwayId,
      },
      code: true,
      success: true,
      elements: {
        id: true,
        parent_id: true,
        name: true,
        label: {
          text: true,
          color: true,
          id: true,
        },
        start_date: true,
        end_date: true,
        status: true,
        type: true,
        activity_type: true,
        stakeholders: {
          id: true,
          name: true,
        },
        context: {
          instance_id: true,
          pathway_id: true,
          step_id: true,
          track_id: true,
        },
      },
    },
  })) as ElementsQueryResponse

  // 3. Get all activities in the track up to current activity
  const activitiesQuery = (await awellSdk.orchestration.query({
    pathwayActivities: {
      __args: {
        pathway_id: pathwayId,
        pagination: {
          offset: 0,
          count: 500
        }
      },
      success: true,
      activities: {
        id: true,
        date: true,
        action: true,
        status: true,
        subject: {
          type: true,
          name: true
        },
        object: {
          id: true,
          type: true,
          name: true
        },
        indirect_object: {
          id: true,
          type: true,
          name: true
        },
        form: {
          id: true,
          title: true,
          questions: {
            key: true,
            title: true,
            questionConfig: {
              mandatory: true
            }
          }
        },
        track: {
          id: true,
          title: true
        },
        context: {
          instance_id: true,
          pathway_id: true,
          track_id: true,
          step_id: true,
          action_id: true
        },
        session_id: true,
        stakeholders: {
          type: true,
          id: true,
          name: true,
          email: true,
          preferred_language: true
        },
        resolution: true,
        stream_id: true
      }
    }
  })) as ActivitiesResponse

  // Find current activity to get its date
  const currentActivity = activitiesQuery.pathwayActivities.activities
    .find(activity => activity.id === currentActivityId)
  
  const currentActivityDate = currentActivity?.date ?? ''

  // Get the track IDs we need to match against
  const relevantTrackIds = new Set<string>();
  activitiesQuery.pathwayActivities.activities.forEach(activity => {
    if (activity.track?.id === trackId) {
      relevantTrackIds.add(activity.track.id);
      // Find the corresponding track element to get its ID
      const trackElement = elementsQuery.pathwayElements.elements.find(
        element => element.type === 'TRACK' && 
        (element.context?.track_id === activity.context?.track_id)
      );
      if (trackElement?.id !== undefined) {
        relevantTrackIds.add(trackElement.id);
      }
    }
  });

  // Filter activities by track and date
  const trackActivities = activitiesQuery.pathwayActivities.activities
    .filter(activity => {
      // An activity belongs to a track if either:
      // 1. Its track.id matches any of the relevant track IDs, or
      // 2. Its context.track_id matches any of the relevant track IDs
      const isInTrack = (activity.track?.id !== undefined && relevantTrackIds.has(activity.track.id)) ||
                       (activity.context?.track_id !== undefined && relevantTrackIds.has(activity.context.track_id))
      const isBeforeOrEqualDate = currentActivityDate.length === 0 || activity.date <= currentActivityDate
      return isInTrack && isBeforeOrEqualDate
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 4. Get data points for all activities in the track
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

  // 6. Enhance activities with data points
  const activitiesWithDataPoints = trackActivities.map(activity => {
    // Find data points for this activity
    const activityDataPoints = dataPointsQuery.pathwayDataPoints.dataPoints
      .filter(dp => dp.activity_id === activity.id)
      .map(dp => {
        // Special handling for activation data points
        if (dp.data_point_definition_id.endsWith('-ACTIVATION')) {
          return {
            ...dp,
            definitionKey: 'activation_date',
            definitionTitle: 'Activation Date',
          };
        }
        return dp;
      });

    // Map form responses to data points if they exist
    const questions = activity.form?.questions;
    if (questions !== undefined && questions !== null) {
      const formResponses = questions.map(question => {
        const dataPoint = activityDataPoints.find(dp => dp.data_point_definition_id === question.key);
        return {
          id: dataPoint?.id ?? '',
          data_set_id: dataPoint?.data_set_id ?? '',
          key: question.key,
          serialized_value: dataPoint?.serialized_value ?? '',
          data_point_definition_id: question.key,
          date: dataPoint?.date ?? activity.date,
          valueType: dataPoint?.valueType ?? 'STRING',
          activity_id: activity.id,
          definitionKey: question.key,
          definitionTitle: question.title,
        };
      });
      activityDataPoints.push(...formResponses);
    }

    return {
      ...activity,
      dataPoints: activityDataPoints
    };
  });

  // 8. Get steps from the elements query and filter by track ID and type STEP
  const steps = elementsQuery.pathwayElements.elements
    .filter(element => {
      const parentId = element.parent_id;
      
      // A step belongs to a track if:
      // 1. Its parent_id matches one of our relevant track IDs
      const isInTrack = parentId !== undefined && relevantTrackIds.has(parentId);
      
      // Only include STEP elements
      const isStep = element.type === 'STEP';
      
      return isInTrack && isStep;
    })
    .map(element => ({
      id: element.id,
      parent_id: element.parent_id,
      name: element.name,
      label: element.label?.text ?? '',
      start_date: element.start_date,
      end_date: element.end_date,
      status: element.status,
      activity_type: element.activity_type,
      stakeholders: element.stakeholders.map(stakeholder => ({
        id: stakeholder.id,
        name: stakeholder.name ?? '',
      })),
      activities: [] as string[],
    }))

  // 9. Associate activities with steps
  const stepsWithActivities = steps.map(step => {
    // Find all activities that belong to this step
    const stepActivities = activitiesWithDataPoints.filter(
      activity => activity.context?.step_id === step.id
    )
    
    return {
      ...step,
      activities: stepActivities.map(activity => activity.id),
    }
  })

  // 10. Process the track data
  const track = pathwayQuery.pathway.pathway.tracks.find((t) => t.id === trackId);
  
  // If track is not found, use default values with just the ID
  const finalTrack = track !== undefined ? {
    id: track.id,
    title: track.title,
  } : {
    id: trackId,
  };

  const rawTrackData = {
    track: finalTrack,
    activities: activitiesWithDataPoints,
    steps: stepsWithActivities,
  }
  // Clean the data for LLM consumption and return only cleaned data
  return await cleanDataForLLM(rawTrackData, awellSdk, pathwayId);
}
