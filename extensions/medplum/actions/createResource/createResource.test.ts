import { createResource } from './createResource'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Create resource', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should be defined', () => {
    expect(createResource).toBeDefined()
  })

  test('Should have the correct key', () => {
    expect(createResource.key).toBe('createResource')
  })

  test('Should create a single resource', async () => {
    const singleResourceJson = JSON.stringify({
      resourceType: 'Patient',
      name: [{ family: 'Test', given: ['Patient'] }],
    })

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        resourceJson: singleResourceJson,
      },
      settings: mockSettings,
    })

    await createResource.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        resourceId: expect.any(String),
        resourceType: 'Patient',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should create resources from a transaction Bundle', async () => {
    const bundleJson = JSON.stringify({
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            name: [{ family: 'Smith' }],
          },
          request: { method: 'POST', url: 'Patient' },
        },
        {
          resource: {
            resourceType: 'Observation',
            status: 'final',
          },
          request: { method: 'POST', url: 'Observation' },
        },
      ],
    })

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        resourceJson: bundleJson,
      },
      settings: mockSettings,
    })

    await createResource.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundleId: 'bundle-response-123',
        bundleType: 'transaction',
        resourceIds: 'patient-1,observation-2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle invalid JSON', async () => {
    const invalidJson = 'not valid json'

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        resourceJson: invalidJson,
      },
      settings: mockSettings,
    })

    await createResource.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
