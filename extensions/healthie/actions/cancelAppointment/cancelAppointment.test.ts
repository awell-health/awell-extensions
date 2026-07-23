import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { cancelAppointment } from '../cancelAppointment'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('cancelAppointment action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(cancelAppointment)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should cancel an appointment', async () => {
    await cancelAppointment.onEvent!({
      payload: generateTestPayload({
        fields: {
          id: 'appointment-1',
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

    expect(mockGetSdkReturn.updateAppointment).toHaveBeenCalledWith({
      input: {
        id: 'appointment-1',
        pm_status: 'Cancelled',
      },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
