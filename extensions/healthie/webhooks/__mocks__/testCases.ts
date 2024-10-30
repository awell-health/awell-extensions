import { appliedTagCreated } from '../appliedTagCreated'
import { appliedTagDeleted } from '../appliedTagDeleted'
import { appointmentCreated } from '../appointmentCreated'
import { appointmentDeleted } from '../appointmentDeleted'
import { appointmentUpdated } from '../appointmentUpdated'
import { formAnswerGroupDeleted } from '../formAnswerGroupDeleted'
import { formAnswerGroupCreated } from '../formAnswerGroupCreated'
import { formAnswerGroupLocked } from '../formAnswerGroupLocked'
import { formAnswerGroupSigned } from '../formAnswerGroupSigned'
import { goalCreated } from '../goalCreated'
import { goalUpdated } from '../goalUpdated'
import { labOrderCreated } from '../labOrderCreated'
import { labOrderUpdated } from '../labOrderUpdated'
import { metricEntryCreated } from '../metricEntryCreated'
import { metricEntryUpdated } from '../metricEntryUpdated'
import { requestFormCompletionCreated } from '../requestedFormCompletionCreated'
import { requestFormCompletionUpdated } from '../requestedFormCompletionUpdated'
import { taskCreated } from '../taskCreated'
import { taskUpdated } from '../taskUpdated'

export const testCases = [
  {
    webhook: appliedTagCreated,
    payload: {
      resource_id: 123,
      resource_id_type: 'Tag',
      event_type: 'tag.created',
    },
    sdkMocks: [
      {
        method: 'getAppliedTag',
        response: { data: { appliedTag: { user_id: 'user_123' } } },
      },
    ],
    dataPoints: [{ key: 'createdAppliedTagId', type: 'id' }],
  },
  {
    webhook: appliedTagDeleted,
    payload: {
      resource_id: 123,
      resource_id_type: 'Tag',
      event_type: 'tag.deleted',
    },
    sdkMocks: [
      {
        method: 'getAppliedTag',
        response: { data: { appliedTag: { user_id: 'user_123' } } },
      },
    ],
    dataPoints: [{ key: 'deletedAppliedTagId', type: 'id' }],
  },
  {
    webhook: appointmentCreated,
    payload: {
      resource_id: 72499,
      resource_id_type: 'Appointment',
      event_type: 'appointment.created',
    },
    sdkMocks: [
      {
        method: 'getAppointment',
        response: { data: { appointment: { user: { id: 'user_125' } } } },
      },
    ],
    dataPoints: [
      { key: 'appointmentId', type: 'id' },
      { key: 'appointment', type: 'json' },
    ],
  },
  {
    webhook: appointmentDeleted,
    payload: {
      resource_id: 72499,
      resource_id_type: 'Appointment',
      event_type: 'appointment.deleted',
    },
    sdkMocks: [
      {
        method: 'getAppointment',
        response: { data: { appointment: { user: { id: 'user_125' } } } },
      },
    ],
    dataPoints: [{ key: 'deletedAppointmentId', type: 'id' }],
  },
  {
    webhook: appointmentUpdated,
    payload: {
      resource_id: 72499,
      resource_id_type: 'Appointment',
      event_type: 'appointment.updated',
    },
    sdkMocks: [
      {
        method: 'getAppointment',
        response: { data: { appointment: { user: { id: 'user_125' } } } },
      },
    ],
    dataPoints: [
      { key: 'updatedAppointmentId', type: 'id' },
      { key: 'appointment', type: 'json' },
    ],
  },
  {
    webhook: formAnswerGroupCreated,
    payload: {
      resource_id: 3457,
      resource_id_type: 'FormAnswerGroup',
      event_type: 'form_answer_group.created',
    },
    sdkMocks: [
      {
        method: 'getFormAnswerGroup',
        response: { data: { formAnswerGroup: { user: { id: 'user_456' } } } },
      },
    ],
    dataPoints: [
      { key: 'createdFormAnswerGroupId', type: 'id' },
      { key: 'createdFormAnswerGroup', type: 'json' },
    ],
  },
  {
    webhook: formAnswerGroupDeleted,
    payload: {
      resource_id: 3456,
      resource_id_type: 'FormAnswerGroup',
      event_type: 'form_answer_group.deleted',
    },
    sdkMocks: [
      {
        method: 'getFormAnswerGroup',
        response: { data: { formAnswerGroup: { user: { id: 'user_456' } } } },
      },
    ],
    dataPoints: [{ key: 'deletedFormAnswerGroupId', type: 'id' }],
  },
  {
    webhook: formAnswerGroupLocked,
    payload: {
      resource_id: 3456,
      resource_id_type: 'FormAnswerGroup',
      event_type: 'form_answer_group.locked',
    },
    sdkMocks: [
      {
        method: 'getFormAnswerGroup',
        response: { data: { formAnswerGroup: { user: { id: 'user_456' } } } },
      },
    ],
    dataPoints: [
      { key: 'lockedFormAnswerGroupId', type: 'id' },
      { key: 'lockedFormAnswerGroup', type: 'json' },
    ],
  },
  {
    webhook: formAnswerGroupSigned,
    payload: {
      resource_id: 3456,
      resource_id_type: 'FormAnswerGroup',
      event_type: 'form_answer_group.signed',
    },
    sdkMocks: [
      {
        method: 'getFormAnswerGroup',
        response: { data: { formAnswerGroup: { user: { id: 'user_456' } } } },
      },
    ],
    dataPoints: [
      { key: 'signedFormAnswerGroupId', type: 'id' },
      { key: 'signedFormAnswerGroup', type: 'json' },
    ],
  },
  {
    webhook: goalCreated,
    payload: {
      resource_id: 456,
      resource_id_type: 'Goal',
      event_type: 'goal.created',
    },
    sdkMocks: [
      { method: 'getGoal', response: { data: { goal: { user_id: '1234' } } } },
    ],
    dataPoints: [{ key: 'createdGoalId', type: 'id' }],
  },
  {
    webhook: goalUpdated,
    payload: {
      resource_id: 456,
      resource_id_type: 'Goal',
      event_type: 'goal.updated',
    },
    sdkMocks: [
      { method: 'getGoal', response: { data: { goal: { user_id: '1234' } } } },
    ],
    dataPoints: [{ key: 'updatedGoalId', type: 'id' }],
  },
  {
    webhook: labOrderCreated,
    payload: {
      resource_id: 666,
      resource_id_type: 'LabOrder',
      event_type: 'lab_order.created',
    },
    sdkMocks: [
      {
        method: 'getLabOrder',
        response: { data: { labOrder: { patient: { id: '1234' } } } },
      },
    ],
    dataPoints: [{ key: 'createdLabOrderId', type: 'id' }],
  },
  {
    webhook: labOrderUpdated,
    payload: {
      resource_id: 666,
      resource_id_type: 'LabOrder',
      event_type: 'lab_order.updated',
    },
    sdkMocks: [
      {
        method: 'getLabOrder',
        response: { data: { labOrder: { patient: { id: '1234' } } } },
      },
    ],
    dataPoints: [{ key: 'updatedLabOrderId', type: 'id' }],
  },
  {
    webhook: metricEntryCreated,
    payload: {
      resource_id: 333,
      resource_id_type: 'MetricEntry',
      event_type: 'metric_entry.created',
    },
    sdkMocks: [
      {
        method: 'getMetricEntry',
        response: { data: { entry: { poster: { id: '12345' } } } },
      },
    ],
    dataPoints: [{ key: 'createdMetricId', type: 'id' }],
  },
  {
    webhook: metricEntryUpdated,
    payload: {
      resource_id: 333,
      resource_id_type: 'MetricEntry',
      event_type: 'metric_entry.updated',
    },
    sdkMocks: [
      {
        method: 'getMetricEntry',
        response: { data: { entry: { poster: { id: '12345' } } } },
      },
    ],
    dataPoints: [{ key: 'updatedMetricId', type: 'id' }],
  },
  {
    webhook: requestFormCompletionCreated,
    payload: {
      resource_id: 888,
      resource_id_type: 'requestFormCompletion',
      event_type: 'request_form_completion.created',
    },
    sdkMocks: [
      {
        method: 'getRequestedFormCompletion',
        response: {
          data: { requestedFormCompletion: { recipient_id: '12345' } },
        },
      },
    ],
    dataPoints: [{ key: 'createdFormCompletionId', type: 'id' }],
  },
  {
    webhook: requestFormCompletionUpdated,
    payload: {
      resource_id: 888,
      resource_id_type: 'requestFormCompletion',
      event_type: 'request_form_completion.updated',
    },
    sdkMocks: [
      {
        method: 'getRequestedFormCompletion',
        response: {
          data: { requestedFormCompletion: { recipient_id: '12345' } },
        },
      },
    ],
    dataPoints: [{ key: 'updatedFormCompletionId', type: 'id' }],
  },
  {
    webhook: taskCreated,
    payload: {
      resource_id: 1112,
      resource_id_type: 'task',
      event_type: 'task.created',
    },
    sdkMocks: [
      {
        method: 'getTask',
        response: { data: { task: { client_id: '12345' } } },
      },
    ],
    dataPoints: [{ key: 'createdTaskId', type: 'id' }],
  },
  {
    webhook: taskUpdated,
    payload: {
      resource_id: 1112,
      resource_id_type: 'task',
      event_type: 'task.updated',
    },
    sdkMocks: [
      {
        method: 'getTask',
        response: { data: { task: { client_id: '12345' } } },
      },
    ],
    dataPoints: [{ key: 'updatedTaskId', type: 'id' }],
  },
]
