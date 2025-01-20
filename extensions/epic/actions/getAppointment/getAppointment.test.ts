import { TestHelpers } from '@awell-health/extensions-core'
import { getAppointment as action } from './getAppointment'
import { EpicFhirR4Client } from '../../lib/api/FhirR4'
import { GetAppointmentMockResponse } from './__testdata__/GetAppointment.mock'
import { createAxiosError } from '../../../../tests'

jest.mock('../../lib/api/FhirR4')

describe('Epic - Get appointment', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('When the patient is found', () => {
    test('Should return the appointment', async () => {
      const mockGetAppointment = jest
        .fn()
        .mockResolvedValue(GetAppointmentMockResponse)
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getAppointment: mockGetAppointment,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
            authUrl:
              'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            clientId: 'client-id',
            privateKey: `-----BEGIN PRIVATE KEY-----`,
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          appointment: JSON.stringify(GetAppointmentMockResponse.data),
          patientId: 'eXbMln3hu0PfFrpv2HgVHyg3',
          appointmentStatus: 'booked',
          appointmentStartDateTime: '2020-11-20T16:45:00Z',
          appointmentTypeCode: 'AMB',
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
      const mockedEpicClient = jest.mocked(EpicFhirR4Client)

      mockedEpicClient.mockImplementation(() => {
        return {
          getAppointment: mockGetAppointment,
        } as unknown as EpicFhirR4Client
      })

      await extensionAction.onEvent({
        payload: {
          fields: {
            resourceId: 'f1OEwaU.E66RGJ3CLbejHKg4',
          },
          settings: {
            baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/',
            authUrl:
              'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
            clientId: 'client-id',
            privateKey: `-----BEGIN PRIVATE KEY-----`,
          },
        } as any,
        onComplete,
        onError,
        helpers,
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
