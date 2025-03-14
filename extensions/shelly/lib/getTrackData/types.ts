import { type AwellSdk } from '@awell-health/awell-sdk'

// Input interface
export interface GetTrackDataInput {
  awellSdk: AwellSdk
  pathwayId: string
  trackId: string
  currentActivityId: string
}

// Output interface
export interface GetTrackDataOutput {
  steps: Array<{
    name: string
    label: string
    status: string
    start_date?: string
    end_date?: string
    stakeholders?: Array<{
      name: string
    }>
    activities: ExtendedActivity[]
  }>
}

// Simplified activity interface
export interface ExtendedActivity {
  date: string
  action: string
  status: string
  resolution?: string
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
    value: string
    title?: string
    date: string
  }>
}

// API response interfaces
export interface PathwayTrack {
  id: string
  title?: string
}

export interface PathwayResponse {
  pathway?: {
    tracks?: PathwayTrack[]
  }
}

export interface ElementResponse {
  id: string
  name: string
  label?: {
    text?: string
  }
  start_date?: string
  end_date?: string
  status: string
  type: string
  stakeholders?: Array<{
    name?: string
  }>
  context?: {
    step_id?: string
    track_id?: string
  }
}

export interface ElementsResponse {
  elements?: ElementResponse[]
}

export interface ActivityResponse {
  id: string
  date: string
  action: string
  status: string
  resolution: string
  subject: {
    type: string
    name: string
  }
  object: {
    type: string
    name: string
    id?: string
  }
  indirect_object?: {
    type?: string
    name?: string
  }
  form?: {
    id?: string
    title?: string
  }
  track?: {
    id?: string
    title?: string
  }
  context?: {
    track_id?: string
    step_id?: string
  }
}

export interface ActivitiesResponse {
  activities?: ActivityResponse[]
}

export interface FormResponseAnswer {
  question_id: string
  value?: string
  label?: string | null
  value_type?: string
}

export interface FormResponseData {
  activity_id: string
  form_id: string
  answers: FormResponseAnswer[]
}

export interface FormQuestionOption {
  label: string
  value: number | string
  value_string: string
}

export interface FormQuestion {
  id: string
  key: string
  title: string
  userQuestionType: string
  options?: FormQuestionOption[]
}

export interface FormDefinition {
  id: string
  title: string
  key: string
  definition_id: string
  release_id: string
  questions: FormQuestion[]
}

export interface FormDefinitionResponse {
  form?: {
    form: FormDefinition
  }
}

export interface ExtendedDataPoint {
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
}

export interface DataPointsResponse {
  dataPoints?: ExtendedDataPoint[]
}

export interface CombinedQueryResponse {
  pathway?: PathwayResponse
  pathwayElements?: ElementsResponse
  pathwayActivities?: ActivitiesResponse
  pathwayDataPoints?: DataPointsResponse
}

export interface MessageResponse {
  message?: {
    message?: {
      id: string
      subject?: string
      body?: string
      format?: string
      attachments?: Array<{
        id: string
        name: string
        type: string
        url: string
      }> | null
    }
  }
}

// Type for form responses map
export type FormResponsesMap = Record<string, Record<string, FormResponseData>>; 