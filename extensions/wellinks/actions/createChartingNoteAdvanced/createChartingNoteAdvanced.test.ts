import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../../healthie/gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../../healthie/gql/__mocks__/sdk'
import { createChartingNoteAdvanced } from '.'
import { mockSettings } from '../../__mocks__/config/settings'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')
const content = [
  {
    "id": "3486803",
    "custom_module_id": "question-1",
    "answer": "Open Answer(Short) sample answer",
    "user_id": "51065",
    "label": "Test Open Answer(Short)",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
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

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
