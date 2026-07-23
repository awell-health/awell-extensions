import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { createLocation } from '../createLocation'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('createLocation action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createLocation)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a location', async () => {
    await createLocation.onEvent!({
      payload: generateTestPayload({
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
          formAnswerMaxSizeKB: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockGetSdkReturn.createLocation).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
