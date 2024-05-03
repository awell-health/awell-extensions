/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  type CreateTaskInput,
  type GetPatientInputType,
  type PatientResponse,
  type TaskResponse,
} from '../schema'
import { mockGetPatientResponse } from './mockPatient'
import { mockCreateTaskResponse } from './mockTask'

export class DockAPIClient {
  getPatient = jest.fn((input: GetPatientInputType): PatientResponse => {
    return { ...mockGetPatientResponse, ...input }
  })

  createTask = jest.fn((input: CreateTaskInput): TaskResponse => {
    return { ...mockCreateTaskResponse, ...input }
  })
}
