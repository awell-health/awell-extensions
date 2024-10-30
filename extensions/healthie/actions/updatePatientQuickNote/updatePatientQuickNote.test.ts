import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { updatePatientQuickNote } from '../updatePatientQuickNote'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('createMetricEntry action', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should update patient quick note', async () => {
    await updatePatientQuickNote.onActivityCreated!(
      generateTestPayload({
        fields: {
          patientId: 'patient-id',
          quickNote: 'QUICK NOTE',
          overwrite: true,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledTimes(1)
    expect(onError).toBeCalledTimes(0)
  })
})
