import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { makeAPIClient } from '../../client'
import { type FindAppointmentFields } from '../../types/appointment'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { findAppointments } from '../findAppointments'
import { mockFindAppointmentsResponse } from '../../__mocks__/constants'

jest.mock('../../client')
describe('find appointments', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
  const mockAPIClient = makeAPIClient as jest.Mock
  mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  const settings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }
  const withFields = (fields: FindAppointmentFields): any => {
    return generateTestPayload({
      fields,
      settings,
    })
  }
  const PATIENT_ID_WITH_APPOINTMENTS = 12345
  const PATIENT_ID_WITHOUT_APPOINTMENTS = 123
  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })
  it('validate findAppointments client', async () => {
    const payload = withFields({ patientId: PATIENT_ID_WITH_APPOINTMENTS })
    await findAppointments.onActivityCreated!(payload, onComplete, onError)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        appointments: JSON.stringify(mockFindAppointmentsResponse),
        appointment_exists: 'true',
      }),
    })
  })
  it('findAppointments fails with string practice ID', async () => {
    const payload = withFields({
      patientId: 12345,
      practiceId: 'asdf' as unknown as number,
    })
    const resp = findAppointments.onActivityCreated!(
      payload,
      onComplete,
      onError
    )
    await expect(resp).rejects.toThrow(ZodError)
  })
  it('validate missing patient ID', async () => {
    const payload = withFields({ patientId: undefined as unknown as number })
    const resp = findAppointments.onActivityCreated!(
      payload,
      onComplete,
      onError
    )
    await expect(resp).rejects.toThrow(ZodError)
  })
  it('no appointments to return appointment_exists: `false`', async () => {
    const payload = withFields({ patientId: PATIENT_ID_WITHOUT_APPOINTMENTS })
    await findAppointments.onActivityCreated!(payload, onComplete, onError)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: expect.objectContaining({
        appointments: '[]',
        appointment_exists: 'false',
      }),
    })
  })
})
