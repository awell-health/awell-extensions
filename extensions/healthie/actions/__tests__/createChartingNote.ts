import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createChartingNote } from '../createChartingNote'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('createChartingNote action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a charting note', async () => {
    await createChartingNote.onActivityCreated(
      {
        pathway: {
          id: 'pathway-id',
          definition_id: 'pathway-definition-id',
        },
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          form_id: 'form-template-1',
          healthie_patient_id: 'patient-1',
          note_content: 'Test content',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getFormTemplate).toHaveBeenCalled()
    expect(mockGetSdkReturn.createFormAnswerGroup).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
