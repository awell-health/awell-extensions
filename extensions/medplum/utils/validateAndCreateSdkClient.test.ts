import { validateAndCreateSdkClient } from './validateAndCreateSdkClient'
import { mockSettings, mockSettingsWithoutBaseUrl } from '../__mocks__'
import { MedplumClient } from '@medplum/core'
import z from 'zod'

jest.mock('@medplum/core')

const mockPayload = {
  patient: { id: 'patient-id' },
  pathway: { id: 'pathway-id' },
  activity: { id: 'activity-id' },
  settings: mockSettings,
  fields: {},
}

const mockPayloadWithoutBaseUrl = {
  ...mockPayload,
  settings: mockSettingsWithoutBaseUrl,
}

describe('validateAndCreateSdkClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create MedplumClient with baseUrl when provided', async () => {
    const fieldsSchema = z.object({})
    
    await validateAndCreateSdkClient({
      fieldsSchema,
      payload: mockPayload,
    })

    expect(MedplumClient).toHaveBeenCalledWith({
      clientId: 'clientId',
      baseUrl: 'https://api.example.com/',
    })
  })

  it('should create MedplumClient without baseUrl when not provided', async () => {
    const fieldsSchema = z.object({})
    
    await validateAndCreateSdkClient({
      fieldsSchema,
      payload: mockPayloadWithoutBaseUrl,
    })

    expect(MedplumClient).toHaveBeenCalledWith({
      clientId: 'clientId',
    })
  })

  it('should create MedplumClient without baseUrl when empty string provided', async () => {
    const fieldsSchema = z.object({})
    const payloadWithEmptyBaseUrl = {
      ...mockPayload,
      settings: { ...mockSettings, baseUrl: '' },
    }
    
    await validateAndCreateSdkClient({
      fieldsSchema,
      payload: payloadWithEmptyBaseUrl,
    })

    expect(MedplumClient).toHaveBeenCalledWith({
      clientId: 'clientId',
    })
  })
})
