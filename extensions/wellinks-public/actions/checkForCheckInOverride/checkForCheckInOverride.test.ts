import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/wellinksSdk'
import { checkForCheckInOverride } from './checkForCheckInOverride'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/wellinksSdk')
jest.mock('../../api/clients/wellinksGraphqlClient')

describe('the checkForOverride action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('when given an empty list, should raise an error', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getChartingItems: mockGetSdkReturn.getChartingItems.mockReturnValueOnce({
        data: {
          chartingItems: null,
        },
      }),
    })
    await checkForCheckInOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
          appointmentTime: '2023-08-08',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )
    mockGetSdkReturn.getChartingItems.mockReturnValue({
      data: {
        chartingItems: null,
      },
    })
    expect(mockGetSdkReturn.getChartingItems).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'WRONG_DATA',
            message: 'Charting Items returned Null',
          },
        }),
      ]),
    })
  })

  test('when given a list of charting items where there is no Override form created after the appointment time', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getChartingItems: mockGetSdkReturn.getChartingItems.mockReturnValueOnce({
        data: {
          chartingItems: [
            {
              id: '1111',
              created_at: '2023-05-16 10:41:00 -0400',
              form_answer_group: {
                id: '2222',
                created_at: '2023-05-16 10:41:00 -0400',
                form_answers: [
                  {
                    custom_module_id: '2602707',
                    label: 'Please select the event type',
                    answer: 'Override check-in automation',
                  },
                  {
                    custom_module_id: '3860906',
                    label: 'Start Sending Schedule Reminders On',
                    answer: '2030-09-05',
                  },
                ],
              },
            },
            {
              id: '1111',
              created_at: '2023-05-16 11:41:00 -0400',
              form_answer_group: {
                id: '2222',
                created_at: '2023-05-16 11:41:00 -0400',
                form_answers: [
                  {
                    custom_module_id: '2602707',
                    label: 'Please select the event type',
                    answer: 'Override Scheduling Reminder Automations',
                  },
                  {
                    custom_module_id: '3860906',
                    label: 'Start Sending Schedule Reminders On',
                    answer: '2000-09-05',
                  },
                ],
              },
            },
          ],
        },
      }),
    })

    await checkForCheckInOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
          appointmentTime: '2023-08-08',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.getChartingItems).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        activeOverride: 'false',
      },
    })
  })

  test('when given a list of charting items with an Override form created after the appointment time', async () => {
    ;(getSdk as jest.Mock).mockReturnValueOnce({
      ...mockGetSdkReturn,
      getChartingItems: mockGetSdkReturn.getChartingItems.mockReturnValueOnce({
        data: {
          chartingItems: [
            {
              id: '1111',
              created_at: '2023-05-16 10:41:00 -0400',
              form_answer_group: {
                id: '2222',
                created_at: '2023-05-16 10:41:00 -0400',
                form_answers: [
                  {
                    custom_module_id: '2602707',
                    label: 'Please select the event type',
                    answer: 'Override check-in automation',
                  },
                  {
                    custom_module_id: '3860906',
                    label: 'Start Sending Schedule Reminders On',
                    answer: '2030-09-05',
                  },
                ],
              },
            },
            {
              id: '1111',
              created_at: '2023-05-16 01:41:00 -0400',
              form_answer_group: {
                id: '2222',
                created_at: '2023-05-16 01:41:00 -0400',
                form_answers: [
                  {
                    custom_module_id: '2602707',
                    label: 'Please select the event type',
                    answer: 'Override Scheduling Reminder Automations',
                  },
                  {
                    custom_module_id: '3860906',
                    label: 'Start Sending Schedule Reminders On',
                    answer: '2000-09-05',
                  },
                ],
              },
            },
          ],
        },
      }),
    })

    await checkForCheckInOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
          appointmentTime: '2020-08-08',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError
    )

    expect(mockGetSdkReturn.getChartingItems).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        activeOverride: 'true',
      },
    })
  })
})
