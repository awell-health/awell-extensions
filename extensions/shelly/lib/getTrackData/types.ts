import { type AwellSdk, type Activity, type Element, type PathwayContext, type Answer, type Option, type Question, type Form, type DataPoint } from '@awell-health/awell-sdk'

/**
 * Input parameters for getTrackData function
 */
export interface GetTrackDataInput {
  awellSdk: AwellSdk
  pathwayId: string
  trackId: string
  currentActivityId: string
}

/**
 * Output interface for getTrackData function.
 * A custom structure that flattens and combines data
 * to make it easier for the LLM to process the information without needing to traverse
 * complex nested structures.
 */
export interface GetTrackDataOutput {
  steps: TrackStep[]
}

/**
 * Step type for output
 * Represents a step in the pathway with its activities and metadata
 */
export interface TrackStep {
  name: string
  label: string
  status: string
  start_date?: string
  end_date?: string | null
  activities: ExtendedActivity[]
}

/**
 * Extended activity interface that includes all relevant activity data.
 * This makes it easier and more efficient for the LLM to process activities without 
 * needing to look for details in different data places.
 */
export interface ExtendedActivity {
  date: string
  action: string
  status: string
  resolution?: string | null
  subject: { type: string; name: string; id?: string }
  object: { type: string; name: string; id?: string }
  indirect_object?: { type: string; name: string; id?: string }
  form?: {
    title: string
    questions?: Array<{
      title: string
      response?: string
    }>
  }
  message?: {
    subject?: string
    body?: string
  }
  data_points?: Array<{
    value: string | null
    title?: string
    date: string
  }>
}

/**
 * Using the SDK Element type with optional fields to pick and choose the fields we need
 * with additional context needed to 'organize' the data
 */
export type ElementResponse = Pick<Element, 
  'id' | 'name' | 'start_date' | 'end_date' | 'status' | 'type'
> & {
  label?: {
    text?: string
  }
  context?: Pick<PathwayContext, 'step_id' | 'track_id'>
}

/**
 * Response wrapper for custom elements data
 */
export interface ElementsResponse {
  elements?: ElementResponse[]
}

/**
 * Custom Activity type with selected fields from SDK's Activity.
 * Includes additional fields for our needs and makes some fields optional.
 */
export type ActivityResponse = Pick<Activity, 
  'id' | 'date' | 'action' | 'status' | 'resolution'
> & {
  subject: Pick<Activity['subject'], 'type' | 'name'>
  object: { type: string; name: string; id?: string }
  indirect_object?: { type: string; name: string; id?: string }
  form?: {
    id?: string
    title?: string
  }
  context?: Pick<PathwayContext, 'track_id' | 'step_id'>
}

/**
 * Response wrapper for activities data
 */
export interface ActivitiesResponse {
  activities?: ActivityResponse[]
}

/**
 * Pick and choose the fields we need from the SDK's Answer type
 */
export type FormResponseAnswer = Pick<Answer, 'question_id' | 'value' | 'label' | 'value_type'>

/**
 * Custom structure to organize form responses by activity.
 */
export interface FormResponseData {
  activity_id: string
  form_id: string
  answers: FormResponseAnswer[]
}

/**
 * Pick and choose the fields we need from the SDK's Option type
 * with additional context needed to 'organize' the data
 */
export type FormQuestionOption = Pick<Option, 'label' | 'value'> & {
  value_string: string
}

/**
 * Pick and choose the fields we need from the SDK's Question type
 * with additional context needed to 'organize' the data
 */
export type FormQuestion = Pick<Question, 'id' | 'key' | 'title' | 'userQuestionType'> & {
  options?: FormQuestionOption[]
}

/**
 * Pick and choose the fields we need from the SDK's Form type
 * with additional questions to combine question/asnwers easier
 */
export type FormDefinition = Pick<Form, 'id' | 'title' | 'key' | 'definition_id' | 'release_id'> & {
  questions: FormQuestion[]
}

/**
 * Response wrapper for form definition data
 */
export interface FormDefinitionResponse {
  form?: {
    form: FormDefinition
  }
}

/**
 * Map type for organizing form responses by activity and form ID.
 * First key is activity ID, second key is form ID.
 */
export type FormResponsesMap = Record<string, Record<string, FormResponseData>>;

/**
 * Extended data point interface with additional fields to enrich the data with definition key and title
 */
export type ExtendedDataPoint = Pick<DataPoint, 
  'id' | 'data_set_id' | 'key' | 'serialized_value' | 'data_point_definition_id' | 'date' | 'valueType' | 'activity_id'
> & {
  // Custom fields not in SDK:
  definitionKey?: string
  definitionTitle?: string
}

export interface DataPointsResponse {
  dataPoints?: ExtendedDataPoint[]
}

/**
 * Combined response interface that aggregates data from multiple queries.
 * A custom structure that helps us organize all the data we need
 * in a single, easy-to-process format.
 */
export interface CombinedQueryResponse {
  pathwayElements?: ElementsResponse
  pathwayActivities?: ActivitiesResponse
  pathwayDataPoints?: DataPointsResponse
}

/**
 * Message response interface for handling message data.
 * We've created a custom structure that includes only the message fields
 * we need for our implementation, making it simpler than the SDK's message type.
 */
export interface MessageResponse {
  message?: {
    message?: {
      id: string
      subject?: string
      body?: string
    }
  }
} 