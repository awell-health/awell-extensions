import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk } from '../../../healthie/gql/__mocks__/sdk'
import { createChartingNoteAdvanced } from '.'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/wellinksSdk')
jest.mock('../../api/clients/wellinksGraphqlClient')
const content = [
    {
        "custom_module_id": "question-1",
        "answer": "Open Answer(Short) sample answer",
        "user_id": "SomeInvalidUserId",
    },
];
describe('createChartingNote action', () => {
    const onComplete = jest.fn()

    beforeAll(() => {
        ; (getSdk as jest.Mock).mockImplementation(mockGetSdk)
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Should fail creating a new Charting note because wrong user_id', async () => {
        expect.assertions(4);
        const error = [
            {
                "code": "custom",
                "message": "User ID SomeInvalidUserId does not match healthie_patient_id patient-1",
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
                        healthie_patient_id: 'patient-1',
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
    })
})
