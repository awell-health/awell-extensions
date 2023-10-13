import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { createLocation } from '../createLocation'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('createLocation action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a location', async () => {
    await createLocation.onActivityCreated(
      generateTestPayload({
        fields: {
          id: 'patient-1',
          name: 'Test location',
          country: '',
          state: '',
          city: '',
          zip: '',
          line1: '',
          line2: '',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.createLocation).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
