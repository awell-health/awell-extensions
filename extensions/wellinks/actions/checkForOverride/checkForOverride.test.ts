import { getSdk } from "../../gql/sdk"
import { mockGetSdk, mockGetSdkReturn } from "../../gql/__mocks__/sdk"
import { checkForOverride } from "./checkForOverride"

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')


describe('the checkForOverride action', () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
 
    beforeAll(() => {
        (getSdk as jest.Mock).mockImplementation(mockGetSdk)
        
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('when given an empty list, should raise an error', async () => {
        (getSdk as jest.Mock).mockReturnValueOnce(
            {
                ...mockGetSdkReturn,
                getChartingItems: mockGetSdkReturn.getChartingItems.mockReturnValueOnce({ 
                    data: { 
                        chartingItems: null
                    }
                })
            })
        await checkForOverride.onActivityCreated(
            {
                pathway: {
                    id: 'pathway-id',
                    definition_id: 'pathway-definition-id'
                },
                activity: {
                    id: 'activity-id'
                },
                patient: { id: 'test-patient' },
                fields: {
                    patientId: 'patientIdTest'
                },
                settings: {
                    apiKey: 'apiKey',
                    apiUrl: 'test-url',
                    selectEventTypeQuestion: '2602707',
                    startSendingRemindersQuestions: '3860906',
                    memberEventFormId: '281216'
                },
            },
            onComplete,
            onError
        )
        mockGetSdkReturn.getChartingItems.mockReturnValue(
            { 
                data: { 
                    chartingItems: null
                }
            }
        )
        expect(mockGetSdkReturn.getChartingItems).toHaveBeenCalled()
        expect(onError).toHaveBeenCalledWith({
            events: expect.arrayContaining([
                expect.objectContaining({
                    error: {
                        category: 'WRONG_DATA',
                        message: 'Charting Items returned Null'
                    }
                })
            ])
        })
    })

    test('when given a proper list of charting items, uses the onComplete', async() => {
        (getSdk as jest.Mock).mockReturnValueOnce(
            {
                ...mockGetSdkReturn,
                getChartingItems: mockGetSdkReturn.getChartingItems.mockReturnValueOnce({ 
                    data: { 
                        chartingItems: [
                            {
                                id: "1111",
                                created_at: "2023-05-16 10:41:00 -0400",
                                form_answer_group: {
                                    id: "2222",
                                    created_at: "2023-05-16 10:41:00 -0400",
                                    form_answers: [
                                        {
                                            custom_module_id: "2602707",
                                            label: "Please select the event type",
                                            answer: "Override Scheduling Reminder Automations"
                                        },
                                        {
                                            custom_module_id: "3860906",
                                            label: "Start Sending Schedule Reminders On",
                                            answer: "2023-09-05"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                })
            }
        )
        
        await checkForOverride.onActivityCreated(
            {
                pathway: {
                    id: 'pathway-id',
                    definition_id: 'pathway-definition-id'
                },
                activity: {
                    id: 'activity-id'
                },
                patient: { id: 'test-patient' },
                fields: {
                    patientId: 'patientIdTest'
                },
                settings: {
                    apiKey: 'apiKey',
                    apiUrl: 'test-url',
                    selectEventTypeQuestion: '2602707',
                    startSendingRemindersQuestions: '3860906',
                    memberEventFormId: '281216'
                },
            },
            onComplete,
            onError
        )

        expect(mockGetSdkReturn.getChartingItems).toHaveBeenCalled()
        expect(onComplete).toHaveBeenCalled()
    })
})