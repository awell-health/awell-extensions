import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { archivePatient } from '../archivePatient'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('archivePatient action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should archive a patient', async () => {
    await archivePatient.onActivityCreated(
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
          id: 'patient-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updatePatient).toHaveBeenCalledWith({
      input: { id: 'patient-1', active: false },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
