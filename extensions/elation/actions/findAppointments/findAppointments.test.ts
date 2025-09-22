import { ZodError } from 'zod'
import { makeAPIClient } from '../../client'
import { findAppointments as action } from '../findAppointments'
import { mockFindAppointmentsResponse } from '../../__mocks__/constants'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../tests/constants'

jest.mock('../../client')

describe('find appointments', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockFindAppointments = jest.fn()

  const PATIENT_ID_WITH_APPOINTMENTS = 12345
  const PATIENT_ID_WITHOUT_APPOINTMENTS = 123

  const validSettings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      findAppointments: jest.fn((params) => {
        if (params.patient === PATIENT_ID_WITH_APPOINTMENTS) {
          return mockFindAppointmentsResponse
        } else {
          return []
        }
      }),
    }))
  })

  beforeEach(() => {
    mockFindAppointments.mockResolvedValue(mockFindAppointmentsResponse)
    clearMocks()
  })

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  it('validate findAppointments client', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientId: PATIENT_ID_WITH_APPOINTMENTS,
        },
        settings: validSettings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        appointments: JSON.stringify(mockFindAppointmentsResponse),
        appointment_exists: 'true',
      }),
    })
  })

  it('findAppointments fails with string practice ID', async () => {
    const resp = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientId: 12345,
          practiceId: 'asdf' as unknown as number,
        },
        settings: validSettings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    await expect(resp).rejects.toThrow(ZodError)
  })

  it('validate missing patient ID', async () => {
    const resp = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientId: undefined as unknown as number,
        },
        settings: validSettings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    await expect(resp).rejects.toThrow(ZodError)
  })

  it('no appointments to return appointment_exists: `false`', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientId: PATIENT_ID_WITHOUT_APPOINTMENTS,
        },
        settings: validSettings,
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        appointments: '[]',
        appointment_exists: 'false',
      }),
    })
  })
})
