import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createChartingNoteAdvanced } from '../createChartingNoteAdvanced'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')
const content = [
  {
    "id": "3486803",
    "custom_module_id": "8404150",
    "answer": "Open Answer(Short) sample answer",
    "user_id": "51065",
    "label": "Test Open Answer(Short)",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486804",
    "custom_module_id": "8404301",
    "answer": "<p>Open Answer(Long) sample answer</p>",
    "user_id": "51065",
    "label": "Open Answer(Long)",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486805",
    "custom_module_id": "8404303",
    "answer": "a",
    "user_id": "51065",
    "label": "Multiple Choice",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486806",
    "custom_module_id": "8404302",
    "answer": "a\nc",
    "user_id": "51065",
    "label": "Multiple Choice(Checkbox)",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486807",
    "custom_module_id": "8404454",
    "answer": "20",
    "user_id": "51065",
    "label": "Number",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486808",
    "custom_module_id": "8404456",
    "answer": "b",
    "user_id": "51065",
    "label": "Dropdown",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  },
  {
    "id": "3486809",
    "custom_module_id": "8404457",
    "answer": "2024-11-11",
    "user_id": "51065",
    "label": "Date",
    "filter_type": null,
    "value_to_filter": null,
    "conditional_custom_module_id": null
  }
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
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    );

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
