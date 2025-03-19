import { type AwellSdk } from '@awell-health/awell-sdk'
import { isNil, isEmpty, get } from 'lodash'
import type {
  GetTrackDataInput,
  GetTrackDataOutput,
  ActivityResponse,
  ElementResponse,
  ExtendedDataPoint,
  FormResponsesMap,
  MessageResponse,
  CombinedQueryResponse,
  FormDefinitionResponse,
  ExtendedActivity,
  FormResponseAnswer
} from './types'

/**
 * Fetch and process track data from Awell SDK
 * @param params Input parameters for fetching track data
 * @returns Processed track data with steps and activities
 */
export const getTrackData = async ({
  awellSdk,
  pathwayId,
  trackId,
  currentActivityId,
}: GetTrackDataInput): Promise<GetTrackDataOutput> => {
  const startTime = Date.now();

  // Validate empty strings
  if (isEmpty(pathwayId)) throw new Error('PathwayId is required');
  if (isEmpty(trackId)) throw new Error('TrackId is required');
  if (isEmpty(currentActivityId)) throw new Error('CurrentActivityId is required');

  // 1. Make a single combined query for all track data needed
  const combinedQuery = await fetchAllTrackData(awellSdk, pathwayId, trackId);

  // Log query results 'size'
  console.log(`Track data fetched for care flow ${pathwayId}, track ${trackId} with ${combinedQuery.pathwayActivities?.activities?.length ?? 0} activities (limit is set to 500), ${combinedQuery.pathwayElements?.elements?.length ?? 0} elements`);

  // 2. Find current activity cutoff date
  const activities = combinedQuery.pathwayActivities?.activities ?? [];
  const currentActivity = activities.find(activity => activity.id === currentActivityId);
  const currentActivityDate = currentActivity?.date ?? '';

  // 3. Filter activities by date cutoff
  const filteredActivities = filterActivitiesByDate(activities, currentActivityDate);

  // 4. Get all steps
  const elements = combinedQuery.pathwayElements?.elements ?? [];
  const trackSteps = filterStepElements(elements);

  // 5. Process data points for activities
  const dataPoints = combinedQuery.pathwayDataPoints?.dataPoints ?? [];
  const activityDataPointsMap = createDataPointsMap(dataPoints);

  // 6. Extract activities with forms for processing
  const activitiesWithForms = extractActivitiesWithForms(filteredActivities);
  console.log(`Processing ${activitiesWithForms.length} forms for care flow ${pathwayId}, track ${trackId}`);

  // 7. Process form definitions and responses
  const { formDefinitionsMap, formResponsesMap } = 
    await processFormDefinitionsAndResponses(awellSdk, pathwayId, activitiesWithForms);

  // 8. Try to extract message activities and fetch message content, but continue if it fails
  let messageContentsMap = new Map<string, { subject?: string; body?: string }>();
  try {
    const messageActivities = extractMessageActivities(filteredActivities);
    console.log(`Processing ${messageActivities.length} messages for care flow ${pathwayId}, track ${trackId}`);
    messageContentsMap = await fetchMessageContents(awellSdk, messageActivities);
  } catch (error) {
    console.error(`Failed to process messages for care flow ${pathwayId}, track ${trackId}: ${error instanceof Error ? error.message : String(error)}`);
    // Log error and continue without message data
  }

  // 9. Finally process steps with activities
  const processedSteps = trackSteps.map(step => 
    processStep(step, filteredActivities, activityDataPointsMap, formDefinitionsMap, formResponsesMap, messageContentsMap)
  );

  // Log completion time
  const processingTime = Date.now() - startTime;
  console.log(`Completed processing track data for care flow ${pathwayId}, track ${trackId} in ${processingTime}ms`);

  return {
    steps: processedSteps
  };
};

/**
 * Fetch all track data in a single combined query
 */
async function fetchAllTrackData(
  awellSdk: AwellSdk, 
  pathwayId: string,
  trackId: string
): Promise<CombinedQueryResponse> {
  try {
    console.log(`Starting track data query for care flow ${pathwayId}, track ${trackId} (activity limit: 500)`);
    const queryStartTime = Date.now();

    const result = await awellSdk.orchestration.query({
      pathwayElements: {  // actually track elements 
        __args: { 
          pathway_id: pathwayId,
          track_id: trackId 
        },
        elements: {
          id: true,
          name: true,
          label: {
            text: true
          },
          start_date: true,
          end_date: true,
          status: true,
          type: true,
          context: {
            step_id: true,
            track_id: true
          }
        }
      },
      pathwayActivities: { // actually track activities
        __args: {
          pathway_id: pathwayId,
          track_id: trackId,
          pagination: { offset: 0, count: 500 } // we should never get more than 500 activities, if there is a track with more than I would say it is justified to cut them off
        },
        activities: {
          id: true,
          date: true,
          action: true,
          status: true,
          resolution: true,
          subject: { type: true, name: true },
          object: { 
            type: true, 
            name: true,
            id: true // id field to get message ID
          },
          indirect_object: { type: true, name: true },
          form: {
            id: true,
            title: true
          },
          track: { id: true, title: true },
          context: { track_id: true, step_id: true }
        }
      },
      pathwayDataPoints: {
        __args: {
          pathway_id: pathwayId,
        },
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
      }
    }) as CombinedQueryResponse;

    const queryTime = Date.now() - queryStartTime;
    console.log(`Completed track data query for care flow ${pathwayId}, track ${trackId} in ${queryTime}ms`);

    return result;
  } catch (error) {
    console.error(`Failed to fetch track data for care flow ${pathwayId}, track ${trackId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Filter activities by date (keeping those before or equal to current activity date)
 */
function filterActivitiesByDate(
  activities: ActivityResponse[], 
  currentActivityDate: string
): ActivityResponse[] {
  if (isEmpty(currentActivityDate)) {
    // If there's no date cutoff, return all activities sorted by date
    return activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  return activities
    .filter(activity => activity.date <= currentActivityDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Filter elements that are steps
 */
function filterStepElements(
  elements: ElementResponse[]
): ElementResponse[] {
  return elements.filter(element => {
    if (isNil(element.type) || isEmpty(element.type)) return false;
    return element.type === 'STEP';
  });
}

/**
 * Create a map of activity ID to data points for faster lookup
 */
function createDataPointsMap(dataPoints: ExtendedDataPoint[]): Map<string, ExtendedDataPoint[]> {
  const activityDataPointsMap = new Map<string, ExtendedDataPoint[]>();
  
  dataPoints.forEach(dataPoint => {
    if (typeof dataPoint.activity_id === 'string' && dataPoint.activity_id !== '') {
      if (!activityDataPointsMap.has(dataPoint.activity_id)) {
        activityDataPointsMap.set(dataPoint.activity_id, []);
      }
      
      // Add enhanced data point with improved title detection
      const enhancedDataPoint = { ...dataPoint };
      
      // Apply pattern-based mappings for titles for easier LLM reasoning
      if (typeof dataPoint.data_point_definition_id === 'string' && dataPoint.data_point_definition_id !== '') {
        if (dataPoint.data_point_definition_id.endsWith('-ACTIVATION')) {
          enhancedDataPoint.definitionTitle = 'Activation Date';
        } else if (dataPoint.data_point_definition_id.endsWith('-COMPLETION')) {
          enhancedDataPoint.definitionTitle = 'Completion Date';
        }
      }
      
      activityDataPointsMap.get(dataPoint.activity_id)?.push(enhancedDataPoint);
    }
  });
  
  return activityDataPointsMap;
}

/**
 * Extract activities with forms for processing
 */
function extractActivitiesWithForms(
  activities: ActivityResponse[]
): Array<{ activityId: string; formId: string }> {
  return activities
    .filter(activity => typeof activity.form?.id === 'string' && activity.form.id !== '')
    .map(activity => ({
      activityId: activity.id,
      formId: activity.form?.id as string
    }));
}

/**
 * Process form definitions and responses in batches
 */
async function processFormDefinitionsAndResponses(
  awellSdk: AwellSdk,
  pathwayId: string, 
  activitiesWithForms: Array<{ activityId: string; formId: string }>
): Promise<{ 
  formDefinitionsMap: Map<string, any>; 
  formResponsesMap: FormResponsesMap 
}> {
  const formDefinitionsMap = new Map<string, any>();
  const formResponsesMap: FormResponsesMap = {};
  
  if (activitiesWithForms.length === 0) {
    return { formDefinitionsMap, formResponsesMap };
  }
  
  // Prepare queries in batches to avoid overloading
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < activitiesWithForms.length; i += batchSize) {
    batches.push(activitiesWithForms.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    await processBatch(awellSdk, pathwayId, batch, formDefinitionsMap, formResponsesMap);
  }
  
  return { formDefinitionsMap, formResponsesMap };
}

/**
 * Process a batch of form definitions and responses
 */
async function processBatch(
  awellSdk: AwellSdk,
  pathwayId: string,
  batch: Array<{ activityId: string; formId: string }>,
  formDefinitionsMap: Map<string, any>,
  formResponsesMap: FormResponsesMap
): Promise<void> {
  try {
    // Create an array of promises for form definitions and responses
    const formDefinitionPromises = batch.map(async ({ formId }) => {
      try {
        // Only fetch form definition if we haven't already
        if (!formDefinitionsMap.has(formId)) {
          return await awellSdk.orchestration.query({
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
          }) as unknown as FormDefinitionResponse;
        }
        return null;
      } catch (error) {
        return null;
      }
    });
    
    const formResponsePromises = batch.map(async ({ activityId }) => {
      try {
        return await awellSdk.orchestration.query({
          formResponse: {
            __args: {
              pathway_id: pathwayId,
              activity_id: activityId
            },
            response: {
              answers: {
                question_id: true,
                value: true,
                label: true,
                value_type: true
              }
            }
          }
        });
      } catch (error) {
        return null;
      }
    });
    
    // Await all promises in the batch
    const formDefinitionResults = await Promise.all(formDefinitionPromises);
    const formResponseResults = await Promise.all(formResponsePromises);
    
    // Process form definitions
    formDefinitionResults.forEach((result: any, index: number) => {
      if (!isNil(result) && !isNil(get(result, 'form.form'))) {
        const { formId } = batch[index];
        formDefinitionsMap.set(formId, get(result, 'form.form'));
      }
    });
    
    // Process form responses
    batch.forEach(({ activityId, formId }, index) => {
      const result = formResponseResults[index];
      if (!isNil(result) && !isNil(get(result, 'formResponse.response'))) {
        const responseData = result.formResponse.response;
        
        // Create the map entry if it doesn't exist
        if (!Object.prototype.hasOwnProperty.call(formResponsesMap, formId)) {
          formResponsesMap[formId] = {};
        }
        
        const answers = Array.isArray(responseData.answers) ? responseData.answers : [];
        
        formResponsesMap[formId][activityId] = {
          activity_id: activityId,
          form_id: formId,
          answers: answers as FormResponseAnswer[]
        };
      }
    });
  } catch (error) {
    console.warn(`Partial form data processed for batch of ${batch.length} forms: ${error instanceof Error ? error.message : String(error)}`);
    // Continue with partial data rather than failing completely
  }
}

/**
 * Extract activities that are messages
 */
function extractMessageActivities(
  activities: ActivityResponse[]
): Array<{ activityId: string; messageId: string; fallbackSubject?: string; fallbackBody?: string }> {
  const messageActivities = activities
    .filter(activity => {
      return !isNil(activity.object) && 
             typeof activity.object.type === 'string' && 
             activity.object.type === 'MESSAGE' &&
             !isNil(activity.object.id) &&
             !isEmpty(activity.object.id);
    })
    .map(activity => {
      const messageId = activity.object.id as string;
      
      // Extract fallback content from activity if available
      let fallbackSubject = '';
      if (!isNil(activity.object.name) && !isEmpty(activity.object.name)) {
        fallbackSubject = activity.object.name;
      }
      
      return {
        activityId: activity.id,
        messageId,
        fallbackSubject,
        fallbackBody: ''
      };
    });
  
  return messageActivities;
}

/**
 * Fetch message contents for message activities
 */
async function fetchMessageContents(
  awellSdk: AwellSdk,
  messageActivities: Array<{ activityId: string; messageId: string; fallbackSubject?: string; fallbackBody?: string }>
): Promise<Map<string, { subject?: string; body?: string }>> {
  const messageContentsMap = new Map<string, { subject?: string; body?: string }>();
  
  if (messageActivities.length === 0) {
    return messageContentsMap;
  }
  
  // Process in batches to avoid overloading
  const batchSize = 5;
  const batches = [];
  
  for (let i = 0; i < messageActivities.length; i += batchSize) {
    batches.push(messageActivities.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    await Promise.all(batch.map(async ({ activityId, messageId, fallbackSubject, fallbackBody }) => {
      try {
        const response = await awellSdk.orchestration.query({
          message: {
            __args: {
              id: messageId
            },
            message: {
              id: true,
              subject: true,
              body: true
            }
          }
        }) as MessageResponse;
        
        if (!isNil(response) && 
            !isNil(response.message) && 
            !isNil(response.message.message)) {
          messageContentsMap.set(activityId, {
            subject: response.message.message.subject,
            body: response.message.message.body
          });
        } else {
          // Use fallback content if available
          const hasFallbackSubject = !isNil(fallbackSubject) && !isEmpty(fallbackSubject);
          const hasFallbackBody = !isNil(fallbackBody) && !isEmpty(fallbackBody);
          
          if (hasFallbackSubject || hasFallbackBody) {
            messageContentsMap.set(activityId, {
              subject: fallbackSubject,
              body: fallbackBody
            });
          }
        }
      } catch (error) {
        // Use fallback content if available after error
        const hasFallbackSubject = !isNil(fallbackSubject) && !isEmpty(fallbackSubject);
        const hasFallbackBody = !isNil(fallbackBody) && !isEmpty(fallbackBody);
        
        if (hasFallbackSubject || hasFallbackBody) {
          messageContentsMap.set(activityId, {
            subject: fallbackSubject,
            body: fallbackBody
          });
        }
      }
    }));
  }
  
  return messageContentsMap;
}

/**
 * Process a step with its activities
 */
function processStep(
  step: ElementResponse,
  trackActivities: ActivityResponse[],
  activityDataPointsMap: Map<string, ExtendedDataPoint[]>,
  formDefinitionsMap: Map<string, any>,
  formResponsesMap: FormResponsesMap,
  messageContentsMap: Map<string, { subject?: string; body?: string }>
): GetTrackDataOutput['steps'][0] {
  const stepActivities = trackActivities
    .filter(activity => activity.context?.step_id === step.id)
    .map(activity => processActivity(
      activity, 
      activityDataPointsMap, 
      formDefinitionsMap, 
      formResponsesMap,
      messageContentsMap
    ));

  return {
    name: step.name,
    label: typeof step.label?.text === 'string' ? step.label.text : '',
    status: step.status,
    start_date: step.start_date,
    end_date: step.end_date,
    activities: stepActivities
  };
}

/**
 * Process an activity with its form and data points
 */
function processActivity(
  activity: ActivityResponse,
  activityDataPointsMap: Map<string, ExtendedDataPoint[]>,
  formDefinitionsMap: Map<string, any>,
  formResponsesMap: FormResponsesMap,
  messageContentsMap: Map<string, { subject?: string; body?: string }>
): ExtendedActivity {
  const baseActivity: ExtendedActivity = {
    date: activity.date,
    action: activity.action,
    status: activity.status,
    resolution: activity.resolution,
    subject: {
      type: activity.subject.type,
      name: activity.subject.name
    },
    object: {
      type: activity.object.type,
      name: activity.object.name
    }
  };

  // Add indirect object if it exists
  if (!isNil(activity.indirect_object?.type) && 
      !isEmpty(activity.indirect_object?.type) && 
      !isNil(activity.indirect_object?.name) &&
      !isEmpty(activity.indirect_object?.name)) {
    baseActivity.indirect_object = {
      type: activity.indirect_object.type,
      name: activity.indirect_object.name
    };
  }

  // Process message if exists
  processActivityMessage(baseActivity, activity, messageContentsMap);
  
  // Process form if exists
  processActivityForm(baseActivity, activity, formDefinitionsMap, formResponsesMap);
  
  // Process data points
  processActivityDataPoints(baseActivity, activity, activityDataPointsMap);

  return baseActivity;
}

/**
 * Process message for an activity
 */
function processActivityMessage(
  baseActivity: ExtendedActivity,
  activity: ActivityResponse,
  messageContentsMap: Map<string, { subject?: string; body?: string }>
): void {
  if (messageContentsMap.has(activity.id)) {
    const messageContent = messageContentsMap.get(activity.id);
    if (!isNil(messageContent)) {
      baseActivity.message = {
        subject: messageContent.subject,
        body: messageContent.body
      };
    }
  }
}

/**
 * Process form for an activity
 */
function processActivityForm(
  baseActivity: ExtendedActivity,
  activity: ActivityResponse,
  formDefinitionsMap: Map<string, any>,
  formResponsesMap: FormResponsesMap
): void {
  if (isNil(activity.form) || isNil(activity.form.id) || activity.form.id === '') {
    return;
  }

  const formId = activity.form.id;
  const formTitle = typeof activity.form.title === 'string' && !isEmpty(activity.form.title)
    ? activity.form.title 
    : 'Untitled Form';
  
  // Check if we have form responses for this activity
  const hasFormResponses = Object.prototype.hasOwnProperty.call(formResponsesMap, formId) && 
                          Object.prototype.hasOwnProperty.call(formResponsesMap[formId], activity.id);
  
  if (hasFormResponses) {
    const formResponseData = formResponsesMap[formId][activity.id];
    const formDefinition = formDefinitionsMap.get(formId);
    
    // Create form with responses
    if (!isNil(formDefinition)) {
      // Map questions to their answers with proper formatting
      baseActivity.form = {
        title: formTitle,
        questions: formResponseData.answers.map(answer => {
          const question = formDefinition.questions.find((q: any) => q.id === answer.question_id);
          let responseText = answer.value ?? 'No response';
          
          // Handle different question types
          if (!isNil(question)) {
            if (question.userQuestionType === 'YES_NO') {
              responseText = responseText === '1' ? 'Yes' : responseText === '0' ? 'No' : 'No response';
            } else if (question.userQuestionType === 'MULTIPLE_CHOICE' && 
                      typeof answer.value === 'string' && !isEmpty(answer.value)) {
              const option = question.options?.find((opt: any) => opt.value_string === answer.value);
              responseText = option?.label ?? responseText;
            }
          }
          
          return {
            title: question?.title ?? answer.question_id,
            response: responseText
          };
        })
      };
    } else {
      // Fallback if form definition not available
      baseActivity.form = {
        title: formTitle,
        questions: formResponseData.answers.map(answer => ({
          title: answer.question_id,
          response: answer.value ?? 'No response'
        }))
      };
    }
  } else {
    // Just include the form title if no responses
    baseActivity.form = {
      title: formTitle
    };
  }
}

/**
 * Process data points for an activity
 */
function processActivityDataPoints(
  baseActivity: ExtendedActivity,
  activity: ActivityResponse,
  activityDataPointsMap: Map<string, ExtendedDataPoint[]>
): void {
  const activityDataPoints = activityDataPointsMap.get(activity.id);
  if (isNil(activityDataPoints) || activityDataPoints.length === 0) {
    return;
  }

  // Determine which data points to include
  let dataPointsToInclude: ExtendedDataPoint[] = [];
  
  const hasForm = !isNil(activity.form) && !isEmpty(get(activity.form, 'id'));
  if (hasForm) {
    // If this activity has a form, only include activation data points, as questions/answers will be processed separately
    dataPointsToInclude = activityDataPoints.filter(dp => 
      !isNil(dp) && !isNil(dp.data_point_definition_id) && 
      dp.data_point_definition_id.endsWith('-ACTIVATION')
    );
  } else {
    // If this activity doesn't have a form, include all data points
    dataPointsToInclude = activityDataPoints;
  }
  
  if (dataPointsToInclude.length > 0) {
    baseActivity.data_points = dataPointsToInclude.map(dp => ({
      value: dp.serialized_value,
      title: !isNil(dp.definitionTitle) ? dp.definitionTitle : (!isNil(dp.key) ? dp.key : dp.data_point_definition_id),
      date: dp.date
    }));
  }
}

