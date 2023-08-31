import { type OAuthGrantClientCredentialsRequest } from '@awell-health/extensions-core'
import type { Task, Appointment, Patient } from '../validation'

export interface CanvasAPIClientConstrutorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

export type Id = string

interface IdResponse {
  id: string
}
export type AppointmentWithIdResponse = IdResponse & Appointment

export type TaskWithIdResponse = IdResponse & Task

export interface EntryWrapperResponse<T> {
  resourceType: string
  type: string
  total: number
  entry: Array<{
    resource: T
  }>
}

export type PatientWithIdResponse = IdResponse & Patient
