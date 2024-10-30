import { createServiceRequest } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings, mockCreateServiceRequestResponse } from '../../__mocks__'

jest.mock('@medplum/core', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MedplumClient: MedplumMockClient } = require('../../__mocks__')

  return {
    MedplumClient: MedplumMockClient,
  }
})

describe('Medplum - Create service request', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a service request', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        patientId: '5d1e74dd-6b92-43e6-ab07-e55d1033fbb6',
        status: 'active',
        intent: 'directive',
        priority: 'urgent',
      },
      activity: {
        id: 'test-activity-id',
      },
      settings: mockSettings,
    })

    await createServiceRequest.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        serviceRequestId: mockCreateServiceRequestResponse.id,
      },
    })
  })
})
