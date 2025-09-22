import { TestHelpers } from '@awell-health/extensions-core'
import { getAppointment as action } from './getAppointment'
import { CernerR4APIClient } from '../../lib/api/FhirR4'
import { GetAppointmentMockResponse } from './__testdata__/GetAppointment.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Cerner - Get appointment', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is found', () => {
    test('Should return the appointment', async () => {
      const mockGetAppointment = jest
        .fn()
        .mockResolvedValue({ data: GetAppointmentMockResponse })
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          getAppointment: mockGetAppointment,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            tenantId: 'some-tenant-id',
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          appointment: JSON.stringify(GetAppointmentMockResponse),
          patientId: '12724066',
          appointmentStatus: 'cancelled',
          appointmentStartDateTime: '2020-01-23T22:10:00Z',
          appointmentTypeCode: undefined,
        },
      })
    })
  })

  describe('When the appointment is not found', () => {
    test('Should return an error', async () => {
      const mockGetAppointment = jest
        .fn()
        .mockRejectedValue(
          createAxiosError(404, 'Not Found', JSON.stringify({})),
        )
      const mockedCernerClient = jest.mocked(CernerR4APIClient)

      mockedCernerClient.mockImplementation(() => {
        return {
          getAppointment: mockGetAppointment,
        } as unknown as CernerR4APIClient
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            tenantId: 'some-tenant-id',
            clientId: 'some-client-id',
            clientSecret: 'some-secret',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Appointment not found' },
          },
        ],
      })
    })
  })
})
