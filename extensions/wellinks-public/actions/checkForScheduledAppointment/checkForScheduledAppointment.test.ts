import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/wellinksSdk'
import { checkForScheduledAppointment } from './checkForScheduledAppointment'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/wellinksSdk')
jest.mock('../../api/clients/wellinksGraphqlClient')

describe('the checkForScheduledAppointment action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('when given a null response for appointments, should raise and error', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getAppointments:
        mockGetSdkReturn.getScheduledAppointments.mockReturnValueOnce({
          data: {
            appointments: null,
          },
        }),
    })

    await checkForScheduledAppointment.onActivityCreated(
      generateTestPayload({
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          patientId: 'patientIdTest',
          appointmentTypeId: 'appointmentTypeIdTest',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.getScheduledAppointments).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: 'Appointments returned null',
          },
        }),
      ]),
    })
  })

  test('when given a response with a filled appointmentlist, calls the OnComplete with a true datapoint', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getAppointments:
        mockGetSdkReturn.getScheduledAppointments.mockReturnValueOnce({
          data: {
            appointments: [
              {
                id: '199571',
                provider_name: 'Example Coach',
                date: '2024-05-26 00:25:00 -0500',
                pm_status: null,
              },
              {
                id: '199571',
                provider_name: 'Example Coach',
                date: '2025-05-26 00:25:00 -0500',
                pm_status: null,
              },
            ],
          },
        }),
    })
    await checkForScheduledAppointment.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
          appointmentTypeId: 'appointmentTypeIdTest',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )
    expect(mockGetSdkReturn.getScheduledAppointments).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          appointmentScheduled: 'true',
        },
      })
    )
  })

  test('when given a response with an empty, non null appointmentlist, calls the OnComplete with a true datapoint', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getAppointments:
        mockGetSdkReturn.getScheduledAppointments.mockReturnValueOnce({
          data: {
            appointments: [],
          },
        }),
    })
    await checkForScheduledAppointment.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
          appointmentTypeId: 'appointmentTypeIdTest',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )
    expect(mockGetSdkReturn.getScheduledAppointments).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          appointmentScheduled: 'false',
        },
      })
    )
  })
})
