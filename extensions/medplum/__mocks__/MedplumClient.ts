/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  mockAppointmentResponse,
  mockCreatePatientResponse,
  mockGetPatientResponse,
  mockCreateServiceRequestResponse,
  mockCreateTaskResponse,
} from './'
import {
  type ResourceType,
  type ExtractResource,
  type Resource,
} from '@medplum/fhirtypes'

export class MedplumClient {
  constructor(config?: { clientId?: string; baseUrl?: string }) {
    // Store config for potential testing verification
    this.config = config
  }

  config?: { clientId?: string; baseUrl?: string }

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

  createResource = jest.fn(<T extends Resource>(resource: T): T | undefined => {
    if (resource.resourceType === 'ServiceRequest')
      return mockCreateServiceRequestResponse as T

    if (resource.resourceType === 'Task') return mockCreateTaskResponse as T

    return undefined
  })

  createResourceIfNoneExist = jest.fn(
    <T extends Resource>(resource: T): T | undefined => {
      if (resource.resourceType === 'Patient')
        return mockCreatePatientResponse as T

      return undefined
    }
  )

  executeBot = jest.fn(() => 'Bot executed!')

  search = jest.fn((resourceType: string, query: any) => {
    if (resourceType === 'Patient') {
      return {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 1,
        entry: [
          {
            resource: { id: 'test-patient-id', ...mockGetPatientResponse }
          }
        ]
      }
    }
    return { resourceType: 'Bundle', type: 'searchset', total: 0, entry: [] }
  })

  executeBatch = jest.fn((bundle: any) => {
    return {
      resourceType: 'Bundle',
      type: bundle.type || 'transaction-response',
      id: 'bundle-response-123',
      entry: bundle.entry?.map((entry: any, index: number) => ({
        response: {
          status: '201 Created',
          location: `${entry.resource?.resourceType || 'Resource'}/${entry.resource?.resourceType?.toLowerCase()}-${index + 1}/_history/1`
        },
        resource: {
          ...entry.resource,
          id: `${entry.resource?.resourceType?.toLowerCase()}-${index + 1}`
        }
      })) || []
    }
  })
}
