/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Safe date scalar that can serialize string or date */
  SafeDate: any;
};

export type ActionPayload = Payload & {
  __typename?: 'ActionPayload';
  calculationId: Scalars['String'];
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export enum ActionType {
  ApiCall = 'API_CALL',
  ApiCallGraphql = 'API_CALL_GRAPHQL',
  Calculation = 'CALCULATION',
  Checklist = 'CHECKLIST',
  ClinicalNote = 'CLINICAL_NOTE',
  Form = 'FORM',
  Message = 'MESSAGE',
  Plugin = 'PLUGIN',
  PushToEmr = 'PUSH_TO_EMR'
}

export type ActivitiesPayload = Payload & {
  __typename?: 'ActivitiesPayload';
  activities: Array<Activity>;
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type Activity = {
  __typename?: 'Activity';
  action: ActivityAction;
  container_name?: Maybe<Scalars['String']>;
  context?: Maybe<PathwayContext>;
  date: Scalars['String'];
  form?: Maybe<Form>;
  id: Scalars['ID'];
  indirect_object?: Maybe<ActivityObject>;
  isUserActivity: Scalars['Boolean'];
  label?: Maybe<ActivityLabel>;
  object: ActivityObject;
  public?: Maybe<Scalars['Boolean']>;
  reference_id: Scalars['String'];
  resolution?: Maybe<ActivityResolution>;
  session_id?: Maybe<Scalars['String']>;
  stakeholders?: Maybe<Array<ActivityObject>>;
  status: ActivityStatus;
  stream_id: Scalars['String'];
  sub_activities: Array<SubActivity>;
  subject: ActivitySubject;
  track?: Maybe<ActivityTrack>;
};

export enum ActivityAction {
  Activate = 'ACTIVATE',
  Assigned = 'ASSIGNED',
  Complete = 'COMPLETE',
  Computed = 'COMPUTED',
  Delegated = 'DELEGATED',
  Deliver = 'DELIVER',
  Discarded = 'DISCARDED',
  Failed = 'FAILED',
  FailedToSend = 'FAILED_TO_SEND',
  Generated = 'GENERATED',
  IsWaitingOn = 'IS_WAITING_ON',
  Postponed = 'POSTPONED',
  Processed = 'PROCESSED',
  Read = 'READ',
  Remind = 'REMIND',
  Scheduled = 'SCHEDULED',
  Send = 'SEND',
  Stopped = 'STOPPED',
  Submitted = 'SUBMITTED'
}

export type ActivityLabel = {
  __typename?: 'ActivityLabel';
  color: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  text: Scalars['String'];
};

export type ActivityObject = {
  __typename?: 'ActivityObject';
  email?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  preferred_language?: Maybe<Scalars['String']>;
  type: ActivityObjectType;
};

export enum ActivityObjectType {
  Action = 'ACTION',
  ApiCall = 'API_CALL',
  Calculation = 'CALCULATION',
  Checklist = 'CHECKLIST',
  ClinicalNote = 'CLINICAL_NOTE',
  EmrReport = 'EMR_REPORT',
  EmrRequest = 'EMR_REQUEST',
  EvaluatedRule = 'EVALUATED_RULE',
  Form = 'FORM',
  Message = 'MESSAGE',
  Pathway = 'PATHWAY',
  Patient = 'PATIENT',
  Plugin = 'PLUGIN',
  PluginAction = 'PLUGIN_ACTION',
  Reminder = 'REMINDER',
  Stakeholder = 'STAKEHOLDER',
  Step = 'STEP',
  Track = 'TRACK',
  User = 'USER'
}

export enum ActivityResolution {
  Failure = 'FAILURE',
  Success = 'SUCCESS'
}

export enum ActivityStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Done = 'DONE',
  Failed = 'FAILED'
}

export type ActivitySubject = {
  __typename?: 'ActivitySubject';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  type: ActivitySubjectType;
};

export enum ActivitySubjectType {
  Awell = 'AWELL',
  Plugin = 'PLUGIN',
  Stakeholder = 'STAKEHOLDER',
  User = 'USER'
}

export type ActivityTrack = {
  __typename?: 'ActivityTrack';
  id?: Maybe<Scalars['String']>;
  title: Scalars['String'];
};

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
};

export type Answer = {
  __typename?: 'Answer';
  question_id: Scalars['String'];
  value: Scalars['String'];
  value_type: DataPointValueType;
};

export type AnswerInput = {
  question_id: Scalars['String'];
  value: Scalars['String'];
};

export type ApiCall = {
  __typename?: 'ApiCall';
  created_at: Scalars['String'];
  id: Scalars['ID'];
  request: ApiCallRequest;
  responses: Array<ApiCallResponse>;
  status: ApiCallStatus;
  title: Scalars['String'];
};

export type ApiCallHeader = {
  __typename?: 'ApiCallHeader';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type ApiCallPayload = Payload & {
  __typename?: 'ApiCallPayload';
  api_call: ApiCall;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ApiCallRequest = {
  __typename?: 'ApiCallRequest';
  body?: Maybe<Scalars['String']>;
  endpoint: Scalars['String'];
  headers: Array<ApiCallHeader>;
  method: ApiCallRequestMethod;
};

export enum ApiCallRequestMethod {
  Get = 'GET',
  Post = 'POST'
}

export type ApiCallResponse = {
  __typename?: 'ApiCallResponse';
  body: Scalars['String'];
  date: Scalars['String'];
  status: Scalars['Float'];
};

export enum ApiCallStatus {
  Failed = 'Failed',
  InProgress = 'InProgress',
  Pending = 'Pending',
  PermanentlyFailed = 'PermanentlyFailed',
  Skipped = 'Skipped',
  Success = 'Success'
}

export type ApiCallsPayload = Payload & {
  __typename?: 'ApiCallsPayload';
  api_calls: Array<ApiCall>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ApiPathwayContext = {
  __typename?: 'ApiPathwayContext';
  id: Scalars['String'];
  pathway_definition_id: Scalars['String'];
  patient_id?: Maybe<Scalars['String']>;
  start_date?: Maybe<Scalars['String']>;
};

export type BaselineDataPoint = {
  __typename?: 'BaselineDataPoint';
  definition: DataPointDefinition;
  value?: Maybe<Scalars['String']>;
};

export type BaselineInfoInput = {
  data_point_definition_id: Scalars['String'];
  value: Scalars['String'];
};

export type BaselineInfoPayload = Payload & {
  __typename?: 'BaselineInfoPayload';
  baselineDataPoints: Array<BaselineDataPoint>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export enum BooleanOperator {
  And = 'AND',
  Or = 'OR'
}

export type BrandingSettings = {
  __typename?: 'BrandingSettings';
  accent_color?: Maybe<Scalars['String']>;
  hosted_page_title?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
};

export type CalculationResultsPayload = {
  __typename?: 'CalculationResultsPayload';
  result: Array<SingleCalculationResult>;
};

export type Checklist = {
  __typename?: 'Checklist';
  items: Array<Scalars['String']>;
  title: Scalars['String'];
};

export type ChecklistPayload = Payload & {
  __typename?: 'ChecklistPayload';
  checklist?: Maybe<Checklist>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ClinicalNotePayload = Payload & {
  __typename?: 'ClinicalNotePayload';
  clinical_note: GeneratedClinicalNote;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Condition = {
  __typename?: 'Condition';
  id: Scalars['ID'];
  operand?: Maybe<Operand>;
  operator?: Maybe<ConditionOperator>;
  reference?: Maybe<Scalars['String']>;
  reference_key?: Maybe<Scalars['String']>;
};

export enum ConditionOperandType {
  Boolean = 'BOOLEAN',
  DataSource = 'DATA_SOURCE',
  Number = 'NUMBER',
  NumbersArray = 'NUMBERS_ARRAY',
  String = 'STRING'
}

export enum ConditionOperator {
  Contains = 'CONTAINS',
  DoesNotContain = 'DOES_NOT_CONTAIN',
  IsAnyOf = 'IS_ANY_OF',
  IsEmpty = 'IS_EMPTY',
  IsEqualTo = 'IS_EQUAL_TO',
  IsGreaterThan = 'IS_GREATER_THAN',
  IsGreaterThanOrEqualTo = 'IS_GREATER_THAN_OR_EQUAL_TO',
  IsInRange = 'IS_IN_RANGE',
  IsLessThan = 'IS_LESS_THAN',
  IsLessThanOrEqualTo = 'IS_LESS_THAN_OR_EQUAL_TO',
  IsNoneOf = 'IS_NONE_OF',
  IsNotEmpty = 'IS_NOT_EMPTY',
  IsNotEqualTo = 'IS_NOT_EQUAL_TO',
  IsNotTrue = 'IS_NOT_TRUE',
  IsTrue = 'IS_TRUE'
}

export type CreatePatientInput = {
  address?: InputMaybe<AddressInput>;
  birth_date?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  last_name?: InputMaybe<Scalars['String']>;
  mobile_phone?: InputMaybe<Scalars['String']>;
  national_registry_number?: InputMaybe<Scalars['String']>;
  patient_code?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  preferred_language?: InputMaybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: InputMaybe<Sex>;
};

export type CreatePatientPayload = Payload & {
  __typename?: 'CreatePatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type DataPointDefinition = {
  __typename?: 'DataPointDefinition';
  category: DataPointSourceType;
  id: Scalars['ID'];
  key: Scalars['String'];
  /** Additonal context on data point */
  metadata?: Maybe<Array<DataPointMetaDataItem>>;
  optional?: Maybe<Scalars['Boolean']>;
  /** Personally identifiable information */
  pii?: Maybe<Scalars['Boolean']>;
  possibleValues?: Maybe<Array<DataPointPossibleValue>>;
  range?: Maybe<Range>;
  title: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  valueType: DataPointValueType;
};

export type DataPointInput = {
  data_point_definition_id: Scalars['String'];
  value: Scalars['String'];
};

export type DataPointMetaDataItem = {
  __typename?: 'DataPointMetaDataItem';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type DataPointPossibleValue = {
  __typename?: 'DataPointPossibleValue';
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export enum DataPointSourceType {
  ApiCall = 'API_CALL',
  ApiCallStatus = 'API_CALL_STATUS',
  Calculation = 'CALCULATION',
  Form = 'FORM',
  Pathway = 'PATHWAY',
  PatientProfile = 'PATIENT_PROFILE',
  Step = 'STEP',
  Track = 'TRACK'
}

export enum DataPointValueType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Number = 'NUMBER',
  NumbersArray = 'NUMBERS_ARRAY',
  String = 'STRING'
}

export type DateFilter = {
  gte?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
};

export type DeletePathwayInput = {
  pathway_id: Scalars['String'];
};

export type DeletePatientInput = {
  patient_id: Scalars['String'];
};

export type Element = {
  __typename?: 'Element';
  activity_type?: Maybe<ActionType>;
  context: PathwayContext;
  end_date?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label?: Maybe<ActivityLabel>;
  name: Scalars['String'];
  parent_id?: Maybe<Scalars['ID']>;
  stakeholders: Array<ElementStakeholder>;
  start_date: Scalars['String'];
  status: ElementStatus;
  type: ElementType;
};

export type ElementStakeholder = {
  __typename?: 'ElementStakeholder';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};

export enum ElementStatus {
  Active = 'ACTIVE',
  Discarded = 'DISCARDED',
  Done = 'DONE',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED',
  Stopped = 'STOPPED'
}

export enum ElementType {
  Action = 'ACTION',
  Pathway = 'PATHWAY',
  Step = 'STEP',
  Track = 'TRACK',
  Trigger = 'TRIGGER'
}

export type ElementsPayload = Payload & {
  __typename?: 'ElementsPayload';
  code: Scalars['String'];
  elements: Array<Element>;
  success: Scalars['Boolean'];
};

export type EmptyPayload = Payload & {
  __typename?: 'EmptyPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type EmrReport = {
  __typename?: 'EmrReport';
  id: Scalars['ID'];
  message_html: Scalars['String'];
  metadata?: Maybe<Array<EmrReportMetadataField>>;
};

export type EmrReportMetadataField = {
  __typename?: 'EmrReportMetadataField';
  id: Scalars['ID'];
  label: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type EmrReportPayload = Payload & {
  __typename?: 'EmrReportPayload';
  code: Scalars['String'];
  report?: Maybe<EmrReport>;
  success: Scalars['Boolean'];
};

export type EvaluateFormRulesInput = {
  answers: Array<AnswerInput>;
  form_id: Scalars['String'];
};

export type EvaluateFormRulesPayload = Payload & {
  __typename?: 'EvaluateFormRulesPayload';
  code: Scalars['String'];
  results: Array<QuestionRuleResult>;
  success: Scalars['Boolean'];
};

export type FilterActivitiesParams = {
  action: StringArrayFilter;
  activity_status: StringArrayFilter;
  activity_type: StringArrayFilter;
  pathway_definition_id: StringArrayFilter;
  patient_id: TextFilterEquals;
};

export type FilterPathwayDataPointDefinitionsParams = {
  category?: InputMaybe<StringArrayFilter>;
  value_type?: InputMaybe<StringArrayFilter>;
};

export type FilterPathways = {
  pathway_definition_id?: InputMaybe<IdFilter>;
  patient_id?: InputMaybe<StringArrayFilter>;
  release_id?: InputMaybe<StringArrayFilter>;
  start_date?: InputMaybe<DateFilter>;
  status?: InputMaybe<StringArrayFilter>;
  version?: InputMaybe<NumberArrayFilter>;
};

export type FilterPatientPathways = {
  status: StringArrayFilter;
};

export type FilterPatients = {
  name?: InputMaybe<TextFilter>;
  national_registry_number?: InputMaybe<TextFilterEquals>;
  patient_code?: InputMaybe<TextFilterEquals>;
  profile_id?: InputMaybe<StringArrayFilter>;
  search?: InputMaybe<TextFilterContains>;
};

export type Form = {
  __typename?: 'Form';
  definition_id: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  questions: Array<Question>;
  release_id: Scalars['String'];
  title: Scalars['String'];
};

export type FormPayload = Payload & {
  __typename?: 'FormPayload';
  code: Scalars['String'];
  form?: Maybe<Form>;
  success: Scalars['Boolean'];
};

export type FormResponse = {
  __typename?: 'FormResponse';
  answers: Array<Answer>;
};

export type FormResponsePayload = Payload & {
  __typename?: 'FormResponsePayload';
  code: Scalars['String'];
  response: FormResponse;
  success: Scalars['Boolean'];
};

export type FormattedText = {
  __typename?: 'FormattedText';
  content: TranslatedText;
  format: Scalars['String'];
};

export type FormsPayload = Payload & {
  __typename?: 'FormsPayload';
  code: Scalars['String'];
  forms?: Maybe<Array<Form>>;
  success: Scalars['Boolean'];
};

export type GeneratedClinicalNote = {
  __typename?: 'GeneratedClinicalNote';
  context: Array<GeneratedClinicalNoteContextField>;
  id: Scalars['ID'];
  narratives: Array<GeneratedClinicalNoteNarrative>;
};

export type GeneratedClinicalNoteContextField = {
  __typename?: 'GeneratedClinicalNoteContextField';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type GeneratedClinicalNoteNarrative = {
  __typename?: 'GeneratedClinicalNoteNarrative';
  body: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  title: Scalars['String'];
};

export type HostedSession = {
  __typename?: 'HostedSession';
  cancel_url?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  pathway_id: Scalars['String'];
  stakeholder: HostedSessionStakeholder;
  status: HostedSessionStatus;
  success_url?: Maybe<Scalars['String']>;
};

export type HostedSessionActivitiesPayload = Payload & {
  __typename?: 'HostedSessionActivitiesPayload';
  activities: Array<Activity>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type HostedSessionPayload = Payload & {
  __typename?: 'HostedSessionPayload';
  branding?: Maybe<BrandingSettings>;
  code: Scalars['String'];
  session: HostedSession;
  success: Scalars['Boolean'];
};

export type HostedSessionStakeholder = {
  __typename?: 'HostedSessionStakeholder';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: HostedSessionStakeholderType;
};

export enum HostedSessionStakeholderType {
  Patient = 'PATIENT',
  Stakeholder = 'STAKEHOLDER'
}

export enum HostedSessionStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Expired = 'EXPIRED'
}

export type IdFilter = {
  eq?: InputMaybe<Scalars['String']>;
};

export enum Language {
  Dutch = 'DUTCH',
  English = 'ENGLISH',
  Estonian = 'ESTONIAN',
  French = 'FRENCH'
}

export type MarkMessageAsReadInput = {
  activity_id: Scalars['String'];
};

export type MarkMessageAsReadPayload = Payload & {
  __typename?: 'MarkMessageAsReadPayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Message = {
  __typename?: 'Message';
  attachments?: Maybe<Array<MessageAttachment>>;
  body: Scalars['String'];
  format: MessageFormat;
  id: Scalars['ID'];
  subject: Scalars['String'];
};

export type MessageAttachment = {
  __typename?: 'MessageAttachment';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: MessageAttachmentType;
  url: Scalars['String'];
};

export enum MessageAttachmentType {
  File = 'FILE',
  Link = 'LINK',
  Video = 'VIDEO'
}

export enum MessageFormat {
  Html = 'HTML',
  Slate = 'SLATE'
}

export type MessagePayload = Payload & {
  __typename?: 'MessagePayload';
  code: Scalars['String'];
  message?: Maybe<Message>;
  success: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPatient: CreatePatientPayload;
  deletePathway: EmptyPayload;
  deletePatient: EmptyPayload;
  evaluateFormRules: EvaluateFormRulesPayload;
  markMessageAsRead: MarkMessageAsReadPayload;
  retryActivity: EmptyPayload;
  retryAllApiCalls: EmptyPayload;
  retryAllFailedApiCalls: EmptyPayload;
  retryAllFailedWebhookCalls: EmptyPayload;
  retryAllFailedWebhookCallsForPathwayDefinition: EmptyPayload;
  retryAllWebhookCalls: EmptyPayload;
  retryApiCall: RetryApiCallPayload;
  retryPushToEmr: EmptyPayload;
  retryWebhookCall: RetryWebhookCallPayload;
  saveBaselineInfo: EmptyPayload;
  startHostedActivitySession: StartHostedActivitySessionPayload;
  startHostedActivitySessionViaHostedPagesLink: StartHostedActivitySessionPayload;
  startHostedPathwaySession: StartHostedPathwaySessionPayload;
  startPathway: StartPathwayPayload;
  stopPathway: EmptyPayload;
  stopTrack: StopTrackPayload;
  submitChecklist: SubmitChecklistPayload;
  submitFormResponse: SubmitFormResponsePayload;
  updateBaselineInfo: EmptyPayload;
  updatePatient: UpdatePatientPayload;
  updatePatientLanguage: UpdatePatientLanguagePayload;
};


export type MutationCreatePatientArgs = {
  input?: InputMaybe<CreatePatientInput>;
};


export type MutationDeletePathwayArgs = {
  input: DeletePathwayInput;
};


export type MutationDeletePatientArgs = {
  input: DeletePatientInput;
};


export type MutationEvaluateFormRulesArgs = {
  input: EvaluateFormRulesInput;
};


export type MutationMarkMessageAsReadArgs = {
  input: MarkMessageAsReadInput;
};


export type MutationRetryActivityArgs = {
  input: RetryActivityInput;
};


export type MutationRetryAllApiCallsArgs = {
  input: RetryAllApiCallsInput;
};


export type MutationRetryAllFailedApiCallsArgs = {
  input: RetryAllFailedApiCallsInput;
};


export type MutationRetryAllFailedWebhookCallsArgs = {
  input: RetryAllFailedWebhookCallsInput;
};


export type MutationRetryAllFailedWebhookCallsForPathwayDefinitionArgs = {
  input: RetryAllFailedWebhookCallsForPathwayDefinitionInput;
};


export type MutationRetryAllWebhookCallsArgs = {
  input: RetryAllWebhookCallsInput;
};


export type MutationRetryApiCallArgs = {
  input: RetryApiCallInput;
};


export type MutationRetryPushToEmrArgs = {
  input: RetryPushToEmrInput;
};


export type MutationRetryWebhookCallArgs = {
  input: RetryWebhookCallInput;
};


export type MutationSaveBaselineInfoArgs = {
  input: SaveBaselineInfoInput;
};


export type MutationStartHostedActivitySessionArgs = {
  input: StartHostedActivitySessionInput;
};


export type MutationStartHostedActivitySessionViaHostedPagesLinkArgs = {
  input: StartHostedActivitySessionViaHostedPagesLinkInput;
};


export type MutationStartHostedPathwaySessionArgs = {
  input: StartHostedPathwaySessionInput;
};


export type MutationStartPathwayArgs = {
  input: StartPathwayInput;
};


export type MutationStopPathwayArgs = {
  input: StopPathwayInput;
};


export type MutationStopTrackArgs = {
  input: StopTrackInput;
};


export type MutationSubmitChecklistArgs = {
  input: SubmitChecklistInput;
};


export type MutationSubmitFormResponseArgs = {
  input: SubmitFormResponseInput;
};


export type MutationUpdateBaselineInfoArgs = {
  input: UpdateBaselineInfoInput;
};


export type MutationUpdatePatientArgs = {
  input: UpdatePatientInput;
};


export type MutationUpdatePatientLanguageArgs = {
  input: UpdatePatientLanguageInput;
};

export type NumberArrayFilter = {
  in?: InputMaybe<Array<Scalars['Float']>>;
};

export type Operand = {
  __typename?: 'Operand';
  type: ConditionOperandType;
  value: Scalars['String'];
};

export type Option = {
  __typename?: 'Option';
  id: Scalars['ID'];
  label: Scalars['String'];
  value: Scalars['Float'];
};

export type PaginationOutput = {
  __typename?: 'PaginationOutput';
  count?: Maybe<Scalars['Float']>;
  offset?: Maybe<Scalars['Float']>;
  total_count?: Maybe<Scalars['Float']>;
};

export type PaginationParams = {
  count: Scalars['Float'];
  offset: Scalars['Float'];
};

export type Pathway = {
  __typename?: 'Pathway';
  activities: Array<Activity>;
  complete_date?: Maybe<Scalars['SafeDate']>;
  dashboards?: Maybe<PathwayDashboard>;
  id: Scalars['ID'];
  pathway_definition_id: Scalars['String'];
  patient: User;
  patient_id: Scalars['String'];
  release_id: Scalars['String'];
  start_date?: Maybe<Scalars['SafeDate']>;
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['SafeDate']>;
  swimlanes: Swimlanes;
  title: Scalars['String'];
  tracks: Array<Track>;
  version?: Maybe<Scalars['Float']>;
};

export type PathwayContext = {
  __typename?: 'PathwayContext';
  action_id?: Maybe<Scalars['String']>;
  instance_id: Scalars['String'];
  pathway_id: Scalars['String'];
  step_id?: Maybe<Scalars['String']>;
  track_id?: Maybe<Scalars['String']>;
};

export type PathwayDashboard = {
  __typename?: 'PathwayDashboard';
  cumulio_auth_id: Scalars['String'];
  cumulio_auth_token: Scalars['String'];
  dashboard_ids: Array<Scalars['String']>;
};

export type PathwayDataPointDefinitionsPayload = Payload & {
  __typename?: 'PathwayDataPointDefinitionsPayload';
  code: Scalars['String'];
  data_point_definitions: Array<DataPointDefinition>;
  success: Scalars['Boolean'];
};

export type PathwayPayload = Payload & {
  __typename?: 'PathwayPayload';
  code: Scalars['String'];
  pathway?: Maybe<Pathway>;
  success: Scalars['Boolean'];
};

export enum PathwayStatus {
  Active = 'active',
  Completed = 'completed',
  MissingBaselineInfo = 'missing_baseline_info',
  Starting = 'starting',
  Stopped = 'stopped'
}

export type PathwaySummary = {
  __typename?: 'PathwaySummary';
  complete_date?: Maybe<Scalars['SafeDate']>;
  id: Scalars['ID'];
  pathway_definition_id?: Maybe<Scalars['String']>;
  patient_id?: Maybe<Scalars['String']>;
  start_date?: Maybe<Scalars['SafeDate']>;
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['SafeDate']>;
  title: Scalars['String'];
  version?: Maybe<Scalars['Float']>;
};

export type PathwaysPayload = Payload & {
  __typename?: 'PathwaysPayload';
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  pathways: Array<PathwaySummary>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type PatientPathway = {
  __typename?: 'PatientPathway';
  baseline_info?: Maybe<Array<BaselineDataPoint>>;
  complete_date?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  pathway_definition_id: Scalars['String'];
  release_id: Scalars['String'];
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  version?: Maybe<Scalars['Float']>;
};

export type PatientPathwaysPayload = Payload & {
  __typename?: 'PatientPathwaysPayload';
  code: Scalars['String'];
  patientPathways: Array<PatientPathway>;
  success: Scalars['Boolean'];
};

export type PatientPayload = Payload & {
  __typename?: 'PatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type PatientProfileInput = {
  address?: InputMaybe<AddressInput>;
  birth_date?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  last_name?: InputMaybe<Scalars['String']>;
  mobile_phone?: InputMaybe<Scalars['String']>;
  national_registry_number?: InputMaybe<Scalars['String']>;
  patient_code?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  preferred_language?: InputMaybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: InputMaybe<Sex>;
};

export type PatientsPayload = Payload & {
  __typename?: 'PatientsPayload';
  code: Scalars['String'];
  pagination: PaginationOutput;
  patients: Array<User>;
  sorting: SortingOutput;
  success: Scalars['Boolean'];
};

export type Payload = {
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type PluginActionField = {
  __typename?: 'PluginActionField';
  id: Scalars['ID'];
  label: Scalars['String'];
  type: PluginActionFieldType;
  value: Scalars['String'];
};

export enum PluginActionFieldType {
  Html = 'HTML',
  Json = 'JSON',
  Numeric = 'NUMERIC',
  String = 'STRING',
  Text = 'TEXT'
}

export type PluginActionSettingsProperty = {
  __typename?: 'PluginActionSettingsProperty';
  key: Scalars['String'];
  label: Scalars['String'];
  value: Scalars['String'];
};

export type PluginActivityRecord = {
  __typename?: 'PluginActivityRecord';
  activity_id: Scalars['String'];
  date: Scalars['String'];
  fields: Array<PluginActionField>;
  id: Scalars['ID'];
  pathway_id: Scalars['String'];
  plugin_action_key: Scalars['String'];
  plugin_key: Scalars['String'];
  settings?: Maybe<Array<PluginActionSettingsProperty>>;
};

export type PluginActivityRecordPayload = Payload & {
  __typename?: 'PluginActivityRecordPayload';
  code: Scalars['String'];
  record: PluginActivityRecord;
  success: Scalars['Boolean'];
};

export type PublishedPathwayDefinition = {
  __typename?: 'PublishedPathwayDefinition';
  /** Starting/baseline data point definitions for the pathway */
  dataPointDefinitions: Array<DataPointDefinition>;
  id: Scalars['ID'];
  release_id?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  version?: Maybe<Scalars['Float']>;
};

export type PublishedPathwayDefinitionsPayload = Payload & {
  __typename?: 'PublishedPathwayDefinitionsPayload';
  code: Scalars['String'];
  publishedPathwayDefinitions: Array<PublishedPathwayDefinition>;
  success: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  activities: ActivitiesPayload;
  apiCall: ApiCallPayload;
  apiCalls: ApiCallsPayload;
  baselineInfo: BaselineInfoPayload;
  calculationAction: ActionPayload;
  calculationResults: CalculationResultsPayload;
  checklist: ChecklistPayload;
  clinicalNote: ClinicalNotePayload;
  emrReport: EmrReportPayload;
  form: FormPayload;
  formResponse: FormResponsePayload;
  forms: FormsPayload;
  hostedSession: HostedSessionPayload;
  hostedSessionActivities: HostedSessionActivitiesPayload;
  message: MessagePayload;
  myActivities: ActivitiesPayload;
  myPathways: PathwaysPayload;
  myPendingActivities: ActivitiesPayload;
  pathway: PathwayPayload;
  pathwayActivities: ActivitiesPayload;
  pathwayDataPointDefinitions: PathwayDataPointDefinitionsPayload;
  pathwayElements: ElementsPayload;
  pathwayStepActivities: ActivitiesPayload;
  pathways: PathwaysPayload;
  patient: PatientPayload;
  patientPathways: PatientPathwaysPayload;
  patients: PatientsPayload;
  pluginActivityRecord: PluginActivityRecordPayload;
  publishedPathwayDefinitions: PublishedPathwayDefinitionsPayload;
  scheduledSteps: ScheduledStepsPayload;
  searchPatientsByNationalRegistryNumber: SearchPatientsPayload;
  searchPatientsByPatientCode: SearchPatientsPayload;
  webhookCall: WebhookCallPayload;
  webhookCalls: WebhookCallsPayload;
  webhookCallsForPathwayDefinition: WebhookCallsPayload;
  webhookCallsForTenant: WebhookCallsPayload;
  whoami: UserPayload;
};


export type QueryActivitiesArgs = {
  filters?: InputMaybe<FilterActivitiesParams>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryApiCallArgs = {
  id: Scalars['String'];
};


export type QueryApiCallsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryBaselineInfoArgs = {
  pathway_id: Scalars['String'];
};


export type QueryCalculationActionArgs = {
  id: Scalars['String'];
};


export type QueryCalculationResultsArgs = {
  activity_id: Scalars['String'];
  pathway_id: Scalars['String'];
};


export type QueryChecklistArgs = {
  id: Scalars['String'];
};


export type QueryClinicalNoteArgs = {
  id: Scalars['String'];
};


export type QueryEmrReportArgs = {
  id: Scalars['String'];
};


export type QueryFormArgs = {
  id: Scalars['String'];
};


export type QueryFormResponseArgs = {
  activity_id: Scalars['String'];
  pathway_id: Scalars['String'];
};


export type QueryFormsArgs = {
  pathway_definition_id: Scalars['String'];
  release_id?: InputMaybe<Scalars['String']>;
};


export type QueryHostedSessionActivitiesArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type QueryMessageArgs = {
  id: Scalars['String'];
};


export type QueryMyActivitiesArgs = {
  pathway_id: Scalars['String'];
};


export type QueryPathwayArgs = {
  id: Scalars['String'];
};


export type QueryPathwayActivitiesArgs = {
  pathway_id: Scalars['String'];
};


export type QueryPathwayDataPointDefinitionsArgs = {
  filters?: InputMaybe<FilterPathwayDataPointDefinitionsParams>;
  pathway_definition_id?: InputMaybe<Scalars['String']>;
  release_id: Scalars['String'];
};


export type QueryPathwayElementsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryPathwayStepActivitiesArgs = {
  pathway_id: Scalars['String'];
  step_id: Scalars['String'];
};


export type QueryPathwaysArgs = {
  filters?: InputMaybe<FilterPathways>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryPatientArgs = {
  id: Scalars['String'];
};


export type QueryPatientPathwaysArgs = {
  filters?: InputMaybe<FilterPatientPathways>;
  patient_id: Scalars['String'];
};


export type QueryPatientsArgs = {
  filters?: InputMaybe<FilterPatients>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryPluginActivityRecordArgs = {
  id: Scalars['String'];
};


export type QueryScheduledStepsArgs = {
  pathway_id: Scalars['String'];
};


export type QuerySearchPatientsByNationalRegistryNumberArgs = {
  national_registry_number: Scalars['String'];
};


export type QuerySearchPatientsByPatientCodeArgs = {
  patient_code: Scalars['String'];
};


export type QueryWebhookCallArgs = {
  webhook_call_id: Scalars['String'];
};


export type QueryWebhookCallsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryWebhookCallsForPathwayDefinitionArgs = {
  pathway_definition_id: Scalars['String'];
};

export type Question = {
  __typename?: 'Question';
  dataPointValueType?: Maybe<DataPointValueType>;
  definition_id: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  options?: Maybe<Array<Option>>;
  questionConfig?: Maybe<QuestionConfig>;
  questionType?: Maybe<QuestionType>;
  rule?: Maybe<Rule>;
  title: Scalars['String'];
  userQuestionType?: Maybe<UserQuestionType>;
};

export type QuestionConfig = {
  __typename?: 'QuestionConfig';
  mandatory: Scalars['Boolean'];
  recode_enabled?: Maybe<Scalars['Boolean']>;
  slider?: Maybe<SliderConfig>;
};

export type QuestionResponseInput = {
  question_id: Scalars['String'];
  value: Scalars['String'];
};

export type QuestionRuleResult = {
  __typename?: 'QuestionRuleResult';
  question_id: Scalars['String'];
  rule_id: Scalars['String'];
  satisfied: Scalars['Boolean'];
};

export enum QuestionType {
  Input = 'INPUT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  NoInput = 'NO_INPUT'
}

export type Range = {
  __typename?: 'Range';
  max?: Maybe<Scalars['Float']>;
  min?: Maybe<Scalars['Float']>;
};

export type RetryActivityInput = {
  activity_id: Scalars['String'];
};

export type RetryAllApiCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllFailedApiCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllFailedWebhookCallsForPathwayDefinitionInput = {
  pathway_definition_id: Scalars['String'];
};

export type RetryAllFailedWebhookCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllWebhookCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryApiCallInput = {
  api_call_id: Scalars['String'];
};

export type RetryApiCallPayload = Payload & {
  __typename?: 'RetryApiCallPayload';
  api_call: ApiCall;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type RetryPushToEmrInput = {
  activity_id: Scalars['String'];
};

export type RetryWebhookCallInput = {
  webhook_call_id: Scalars['String'];
};

export type RetryWebhookCallPayload = Payload & {
  __typename?: 'RetryWebhookCallPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_call: WebhookCall;
};

export type Rule = {
  __typename?: 'Rule';
  boolean_operator: BooleanOperator;
  conditions: Array<Condition>;
  definition_id?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type SaveBaselineInfoInput = {
  baseline_info: Array<BaselineInfoInput>;
  pathway_id: Scalars['String'];
};

export type ScheduledStepsPayload = Payload & {
  __typename?: 'ScheduledStepsPayload';
  code: Scalars['String'];
  steps: Array<Element>;
  success: Scalars['Boolean'];
};

export type SearchPatientsPayload = Payload & {
  __typename?: 'SearchPatientsPayload';
  code: Scalars['String'];
  patients: Array<User>;
  success: Scalars['Boolean'];
};

export enum Sex {
  Female = 'FEMALE',
  Male = 'MALE',
  NotKnown = 'NOT_KNOWN'
}

export type SingleCalculationResult = {
  __typename?: 'SingleCalculationResult';
  status?: Maybe<Scalars['String']>;
  subresult_id: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  value: Scalars['String'];
  value_type?: Maybe<DataPointValueType>;
};

export type SliderConfig = {
  __typename?: 'SliderConfig';
  display_marks: Scalars['Boolean'];
  is_value_tooltip_on: Scalars['Boolean'];
  max: Scalars['Float'];
  max_label: Scalars['String'];
  min: Scalars['Float'];
  min_label: Scalars['String'];
  show_min_max_values: Scalars['Boolean'];
  step_value: Scalars['Float'];
};

export type SortingOutput = {
  __typename?: 'SortingOutput';
  direction: Scalars['String'];
  field: Scalars['String'];
};

export type SortingParams = {
  direction: Scalars['String'];
  field: Scalars['String'];
};

export type StartHostedActivitySessionInput = {
  cancel_url?: InputMaybe<Scalars['String']>;
  language?: InputMaybe<Language>;
  pathway_id: Scalars['String'];
  stakeholder_id: Scalars['String'];
  success_url?: InputMaybe<Scalars['String']>;
};

export type StartHostedActivitySessionPayload = Payload & {
  __typename?: 'StartHostedActivitySessionPayload';
  code: Scalars['String'];
  language?: Maybe<Language>;
  session_id: Scalars['String'];
  session_url: Scalars['String'];
  success: Scalars['Boolean'];
};

export type StartHostedActivitySessionViaHostedPagesLinkInput = {
  hosted_pages_link_id: Scalars['String'];
};

export type StartHostedPathwaySessionInput = {
  cancel_url?: InputMaybe<Scalars['String']>;
  data_points?: InputMaybe<Array<DataPointInput>>;
  language?: InputMaybe<Language>;
  pathway_definition_id: Scalars['String'];
  patient_id?: InputMaybe<Scalars['String']>;
  success_url?: InputMaybe<Scalars['String']>;
};

export type StartHostedPathwaySessionPayload = Payload & {
  __typename?: 'StartHostedPathwaySessionPayload';
  code: Scalars['String'];
  pathway_id: Scalars['String'];
  session_id: Scalars['String'];
  session_url: Scalars['String'];
  stakeholder: HostedSessionStakeholder;
  success: Scalars['Boolean'];
};

export type StartPathwayInput = {
  data_points?: InputMaybe<Array<DataPointInput>>;
  pathway_definition_id: Scalars['String'];
  patient_id: Scalars['String'];
};

export type StartPathwayPayload = {
  __typename?: 'StartPathwayPayload';
  pathway_id: Scalars['String'];
};

export type StopPathwayInput = {
  pathway_id: Scalars['String'];
  reason?: InputMaybe<Scalars['String']>;
};

export type StopTrackInput = {
  pathway_id: Scalars['String'];
  track_id: Scalars['String'];
};

export type StopTrackPayload = Payload & {
  __typename?: 'StopTrackPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  track: Element;
};

export type StringArrayFilter = {
  in?: InputMaybe<Array<Scalars['String']>>;
};

export type SubActivity = {
  __typename?: 'SubActivity';
  action: ActivityAction;
  date: Scalars['String'];
  error?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  object?: Maybe<ActivityObject>;
  subject: ActivitySubject;
};

export type SubmitChecklistInput = {
  activity_id: Scalars['String'];
};

export type SubmitChecklistPayload = {
  __typename?: 'SubmitChecklistPayload';
  activity: Activity;
};

export type SubmitFormResponseInput = {
  activity_id: Scalars['String'];
  response: Array<QuestionResponseInput>;
};

export type SubmitFormResponsePayload = Payload & {
  __typename?: 'SubmitFormResponsePayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Subscription = {
  __typename?: 'Subscription';
  activityCompleted: Activity;
  activityCreated: Activity;
  activityUpdated: Activity;
  apiCallCreated: ApiCall;
  apiCallUpdated: ApiCall;
  elementCompleted: Element;
  elementCreated: Element;
  elementUpdated: Element;
  pathwayUpdated: Pathway;
  sessionActivityCompleted: Activity;
  sessionActivityCreated: Activity;
  sessionActivityUpdated: Activity;
  sessionCompleted: HostedSession;
  sessionExpired: HostedSession;
  webhookCallCreated: WebhookCall;
  webhookCallUpdated: WebhookCall;
};


export type SubscriptionActivityCompletedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionActivityCreatedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionActivityUpdatedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionApiCallCreatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionApiCallUpdatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionElementCompletedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionElementCreatedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionElementUpdatedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionPathwayUpdatedArgs = {
  id: Scalars['ID'];
};


export type SubscriptionSessionActivityCompletedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionSessionActivityCreatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionSessionActivityUpdatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionWebhookCallCreatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionWebhookCallUpdatedArgs = {
  pathway_id: Scalars['String'];
};

export type Swimlane = {
  __typename?: 'Swimlane';
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type SwimlaneItem = {
  __typename?: 'SwimlaneItem';
  category: SwimlaneItemCategory;
  column_index: Scalars['Float'];
  date?: Maybe<Scalars['SafeDate']>;
  documentation?: Maybe<FormattedText>;
  id: Scalars['ID'];
  info?: Maybe<Scalars['String']>;
  lane_id: Scalars['ID'];
  row_index: Scalars['Float'];
  title: Scalars['String'];
  track_id?: Maybe<Scalars['ID']>;
  type: SwimlaneItemType;
};

export enum SwimlaneItemCategory {
  Action = 'ACTION',
  PathwayEnd = 'PATHWAY_END',
  PathwayStart = 'PATHWAY_START',
  Step = 'STEP',
  Track = 'TRACK',
  TrackEnd = 'TRACK_END',
  TrackStart = 'TRACK_START'
}

export enum SwimlaneItemType {
  Active = 'active',
  Completed = 'completed',
  Pending = 'pending',
  Possible = 'possible'
}

export type SwimlaneLink = {
  __typename?: 'SwimlaneLink';
  destination_id: Scalars['ID'];
  id: Scalars['ID'];
  origin_id: Scalars['ID'];
};

export type Swimlanes = {
  __typename?: 'Swimlanes';
  items: Array<SwimlaneItem>;
  lanes: Array<Swimlane>;
  links: Array<SwimlaneLink>;
};

export type Tenant = {
  __typename?: 'Tenant';
  accent_color: Scalars['String'];
  hosted_page_title: Scalars['String'];
  is_default: Scalars['Boolean'];
  logo_path: Scalars['String'];
  name: Scalars['String'];
};

export type TextFilter = {
  contains?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
};

export type TextFilterContains = {
  contains?: InputMaybe<Scalars['String']>;
};

export type TextFilterEquals = {
  eq?: InputMaybe<Scalars['String']>;
};

export type Track = {
  __typename?: 'Track';
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type TranslatedText = {
  __typename?: 'TranslatedText';
  en?: Maybe<Scalars['String']>;
};

export type UpdateBaselineInfoInput = {
  baseline_info: Array<BaselineInfoInput>;
  pathway_id: Scalars['String'];
};

export type UpdatePatientInput = {
  patient_id: Scalars['String'];
  profile: PatientProfileInput;
};

export type UpdatePatientLanguageInput = {
  preferred_language: Scalars['String'];
};

export type UpdatePatientLanguagePayload = Payload & {
  __typename?: 'UpdatePatientLanguagePayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type UpdatePatientPayload = Payload & {
  __typename?: 'UpdatePatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  profile?: Maybe<UserProfile>;
  tenant: Tenant;
};

export type UserPayload = Payload & {
  __typename?: 'UserPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  user: User;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  address?: Maybe<Address>;
  birth_date?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  last_name?: Maybe<Scalars['String']>;
  mobile_phone?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  national_registry_number?: Maybe<Scalars['String']>;
  patient_code?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  preferred_language?: Maybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: Maybe<Sex>;
};

export enum UserQuestionType {
  Date = 'DATE',
  Description = 'DESCRIPTION',
  LongText = 'LONG_TEXT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  MultipleChoiceGrid = 'MULTIPLE_CHOICE_GRID',
  MultipleSelect = 'MULTIPLE_SELECT',
  Number = 'NUMBER',
  ShortText = 'SHORT_TEXT',
  Signature = 'SIGNATURE',
  Slider = 'SLIDER',
  YesNo = 'YES_NO'
}

export type WebhookCall = {
  __typename?: 'WebhookCall';
  created_at: Scalars['String'];
  event_type: Scalars['String'];
  id: Scalars['ID'];
  pathway?: Maybe<ApiPathwayContext>;
  request: WebhookCallRequest;
  responses: Array<WebhookCallResponse>;
  status: Scalars['String'];
  webhook_id: Scalars['String'];
  webhook_name: Scalars['String'];
};

export type WebhookCallHeader = {
  __typename?: 'WebhookCallHeader';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type WebhookCallPayload = Payload & {
  __typename?: 'WebhookCallPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_call: WebhookCall;
};

export type WebhookCallRequest = {
  __typename?: 'WebhookCallRequest';
  body: Scalars['String'];
  endpoint: Scalars['String'];
  headers: Array<WebhookCallHeader>;
  method: Scalars['String'];
};

export type WebhookCallResponse = {
  __typename?: 'WebhookCallResponse';
  body: Scalars['String'];
  date: Scalars['String'];
  status: Scalars['Float'];
};

export type WebhookCallsPayload = Payload & {
  __typename?: 'WebhookCallsPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_calls: Array<WebhookCall>;
};

export type StartPathwayMutationVariables = Exact<{
  input: StartPathwayInput;
}>;


export type StartPathwayMutation = { __typename?: 'Mutation', startPathway: { __typename?: 'StartPathwayPayload', pathway_id: string } };


export const StartPathwayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartPathway"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartPathwayInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startPathway"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pathway_id"}}]}}]}}]} as unknown as DocumentNode<StartPathwayMutation, StartPathwayMutationVariables>;