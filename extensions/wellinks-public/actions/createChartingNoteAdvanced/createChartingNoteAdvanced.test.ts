import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/wellinksSdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/wellinksSdk';
import { createChartingNoteAdvanced } from '.'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/wellinksSdk')
jest.mock('../../api/clients/wellinksGraphqlClient')
const content = [
  {
    "custom_module_id": "question-1",
    "answer": "Open Answer(Short) sample answer",
    "user_id": "98778",
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

  test('Should create a charting note', async () => {
    await createChartingNoteAdvanced.onActivityCreated(
      generateTestPayload({
        fields: {
          form_id: 'form-template-1',
          healthie_patient_id: '98778',
          note_content: JSON.stringify(content),
          marked_locked: true,
          appointment_id: 'appointment-1'
        },
        settings: mockSettings,
      }),
      onComplete,
      jest.fn()
    );

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
