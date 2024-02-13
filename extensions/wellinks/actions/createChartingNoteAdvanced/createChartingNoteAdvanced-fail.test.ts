import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/wellinksSdk';
import { createChartingNoteAdvanced } from '.'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/wellinksSdk')
jest.mock('../../api/clients/wellinksGraphqlClient')

describe('createChartingNote action', () => {
    const onComplete = jest.fn()

    beforeAll(() => {
        ; (getSdk as jest.Mock).mockImplementation(mockGetSdk)
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Should fail creating a new Charting note because wrong user_id in note content', async () => {
        const content = [
            {
                "custom_module_id": "question-1",
                "answer": "Open Answer(Short) sample answer",
                "user_id": "99999",
            },
        ];
        expect.assertions(4);
        const error = [
            {
                "code": "custom",
                "message": "User ID 99999 does not match healthie_patient_id 908777",
                "path": [
                    "note_content"
                ],
                "fatal": true
            }
        ];
        try {
            await createChartingNoteAdvanced.onActivityCreated(
                generateTestPayload({
                    fields: {
                        form_id: 'form-template-1',
                        healthie_patient_id: '908777',
                        note_content: JSON.stringify(content),
                        marked_locked: true,
                        appointment_id: 'appointment-1'
                    },
                    settings: mockSettings,
                }),
                onComplete,
                jest.fn()
            );
        } catch (e: any) {
            const res = JSON.parse(e.message);
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('message');
            expect(res[0]).toHaveProperty('code');
            expect(res[0].message).toBe(error[0].message);
        }
    });

    test('Should fail creating a new Charting note because healthie_user_id is NaN', async () => {
        const content = [
            {
                "custom_module_id": "question-1",
                "answer": "Open Answer(Short) sample answer",
                "user_id": "90877A",
            },
        ];
        expect.assertions(4);
        const error = [
            {
                "code": "custom",
                "message": "healthie_patient_id 90877A is an invalid number",
                "path": [
                    "healthie_patient_id"
                ],
                "fatal": true
            }
        ];
        try {
            await createChartingNoteAdvanced.onActivityCreated(
                generateTestPayload({
                    fields: {
                        form_id: 'form-template-1',
                        healthie_patient_id: '90877A',
                        note_content: JSON.stringify(content),
                        marked_locked: true,
                        appointment_id: 'appointment-1'
                    },
                    settings: mockSettings,
                }),
                onComplete,
                jest.fn()
            );
        } catch (e: any) {
            const res = JSON.parse(e.message);
            expect(res).toHaveLength(1);
            expect(res[0]).toHaveProperty('message');
            expect(res[0]).toHaveProperty('code');
            expect(res[0].message).toBe(error[0].message);
        }
    });

    test('Should fail because user does not exists', async () => {
        (mockGetSdkReturn.getUser as jest.Mock).mockReturnValue({ data: { user: null } })
        const content = [
            {
                "custom_module_id": "question-1",
                "answer": "Open Answer(Short) sample answer",
                "user_id": "90877",
            },
        ];
        expect.assertions(2);

        try {
            await createChartingNoteAdvanced.onActivityCreated(
                generateTestPayload({
                    fields: {
                        form_id: 'form-template-1',
                        healthie_patient_id: '90877',
                        note_content: JSON.stringify(content),
                        marked_locked: true,
                        appointment_id: 'appointment-1'
                    },
                    settings: mockSettings,
                }),
                onComplete,
                jest.fn()
            );
        } catch (e: any) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe('User with id 90877 doesn\'t exist or is not a patient');
        }
    });

    test('Should fail because user is not a patient', async () => {
        (mockGetSdkReturn.getUser as jest.Mock).mockReturnValue({ data: { user: { id: '90877', is_patient: false } } })
        const content = [
            {
                "custom_module_id": "question-1",
                "answer": "Open Answer(Short) sample answer",
                "user_id": "90877",
            },
        ];
        expect.assertions(2);

        try {
            await createChartingNoteAdvanced.onActivityCreated(
                generateTestPayload({
                    fields: {
                        form_id: 'form-template-1',
                        healthie_patient_id: '90877',
                        note_content: JSON.stringify(content),
                        marked_locked: true,
                        appointment_id: 'appointment-1'
                    },
                    settings: mockSettings,
                }),
                onComplete,
                jest.fn()
            );
        } catch (e: any) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe('User with id 90877 doesn\'t exist or is not a patient');
        }
    });
})
