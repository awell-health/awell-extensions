/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  mockAppointmentResponse,
  mockCreatePatientResponse,
  mockGetPatientResponse,
} from './'
import {
  type ResourceType,
  type ExtractResource,
  type Resource,
} from '@medplum/fhirtypes'

export class MedplumClient {
  startClientLogin = jest.fn()

  readResource = jest.fn(
    <K extends ResourceType>(
      resourceType: K,
      id: string
    ): ExtractResource<K> | undefined => {
      if (resourceType === 'Patient')
        return { id, ...mockGetPatientResponse } as ExtractResource<K>

      if (resourceType === 'Appointment')
        return { id, ...mockAppointmentResponse } as ExtractResource<K>

      return undefined
    }
  )

  createResourceIfNoneExist = jest.fn(
    <T extends Resource>(resource: T): T | undefined => {
      if (resource.resourceType === 'Patient')
        return mockCreatePatientResponse as T

      return undefined
    }
  )
}
