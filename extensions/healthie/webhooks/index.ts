import { appointmentCreated } from './appointmentCreated'
import { patientCreated } from './patientCreated'
import { appliedTagCreated } from './appliedTagCreated'
import { appliedTagDeleted } from './appliedTagDeleted'
import { appointmentDeleted } from './appointmentDeleted'
import { appointmentUpdated } from './appointmentUpdated'
import { formAnswerGroupCreated } from './formAnswerGroupCreated'
import { formAnswerGroupDeleted } from './formAnswerGroupDeleted'
import { formAnswerGroupLocked } from './formAnswerGroupLocked'
import { formAnswerGroupSigned } from './formAnswerGroupSigned'
import { labOrderCreated } from './labOrderCreated'
import { labOrderUpdated } from './labOrderUpdated'
import { messageCreated } from './messageCreated'
import { messageDeleted } from './messageDeleted'
import { metricEntryCreated } from './metricEntryCreated'
import { metricEntryDeleted } from './metricEntryDeleted'
import { metricEntryUpdated } from './metricEntryUpdated'
import { patientUpdated } from './patientUpdated'
import { requestFormCompletionCreated } from './requestedFormCompletionCreated'
import { requestFormCompletionDeleted } from './requestedFormCompletionDeleted'
import { requestFormCompletionUpdated } from './requestedFormCompletionUpdated'
import { taskCreated } from './taskCreated'
import { taskDeleted } from './taskDeleted'
import { taskUpdated } from './taskUpdated'
import { goalCreated } from './goalCreated'
import { goalUpdated } from './goalUpdated'
import { goalDeleted } from './goalDeleted'

export type { AppointmentCreated } from './appointmentCreated'
export type { PatientCreated } from './patientCreated'
export type { AppliedTagCreated } from './appliedTagCreated'
export type { AppliedTagDeleted } from './appliedTagDeleted'
export type { AppointmentDeleted } from './appointmentDeleted'
export type { AppointmentUpdated } from './appointmentUpdated'
export type { FormAnswerGroupCreated } from './formAnswerGroupCreated'
export type { FormAnswerGroupDeleted } from './formAnswerGroupDeleted'
export type { FormAnswerGroupLocked } from './formAnswerGroupLocked'
export type { FormAnswerGroupSigned } from './formAnswerGroupSigned'
export type { LabOrderCreated } from './labOrderCreated'
export type { LabOrderUpdated } from './labOrderUpdated'
export type { MessageCreated } from './messageCreated'
export type { MessageDeleted } from './messageDeleted'
export type { MetricEntryCreated } from './metricEntryCreated'
export type { MetricEntryDeleted } from './metricEntryDeleted'
export type { MetricEntryUpdated } from './metricEntryUpdated'
export type { PatientUpdated } from './patientUpdated'
export type { RequestFormCompletionCreated } from './requestedFormCompletionCreated'
export type { RequestFormCompletionDeleted } from './requestedFormCompletionDeleted'
export type { RequestFormCompletionUpdated } from './requestedFormCompletionUpdated'
export type { TaskCreated } from './taskCreated'
export type { TaskDeleted } from './taskDeleted'
export type { TaskUpdated } from './taskUpdated'
export type { GoalCreated } from './goalCreated'
export type { GoalUpdated } from './goalUpdated'
export type { GoalDeleted } from './goalDeleted'

export const webhooks = [
  appointmentCreated,
  patientCreated,
  appliedTagCreated,
  appliedTagDeleted,
  appointmentDeleted,
  appointmentUpdated,
  formAnswerGroupCreated,
  formAnswerGroupDeleted,
  formAnswerGroupLocked,
  formAnswerGroupSigned,
  labOrderCreated,
  labOrderUpdated,
  messageCreated,
  messageDeleted,
  metricEntryCreated,
  metricEntryDeleted,
  metricEntryUpdated,
  patientUpdated,
  requestFormCompletionCreated,
  requestFormCompletionDeleted,
  requestFormCompletionUpdated,
  taskCreated,
  taskDeleted,
  taskUpdated,
  goalCreated,
  goalUpdated,
  goalDeleted,
]
