import { mockPatientResponse } from './mockData'
import { type Patient } from '@medplum/fhirtypes'

export class MedplumClient {
  startClientLogin = jest.fn()

  readResource = jest.fn((resource: string, identifier: string): Patient => {
    return { id: identifier, ...mockPatientResponse }
  })
}
