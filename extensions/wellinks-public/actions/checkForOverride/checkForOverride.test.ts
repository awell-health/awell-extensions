import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/wellinksSdk'
import { checkForOverride } from './checkForOverride'
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
    await checkForOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
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

  test('when given a list of charting items where the most recent Override form has an end date in the past, uses the onComplete', async () => {
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
                    answer: 'Override Scheduling Reminder Automations',
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

    await checkForOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
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
        overrideDate: null,
      },
    })
  })

  test('when given a list of charting items where the most recent Override form has an end date in the future, uses the onComplete', async () => {
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
                    answer: 'Override Scheduling Reminder Automations',
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

    await checkForOverride.onActivityCreated(
      generateTestPayload({
        fields: {
          patientId: 'patientIdTest',
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
        overrideDate: '2030-09-05T00:00:00.000Z',
      },
    })
  })
})
