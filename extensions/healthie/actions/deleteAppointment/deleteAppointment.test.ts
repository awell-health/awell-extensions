import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { deleteAppointment } from '../deleteAppointment'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('deleteAppointment action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(deleteAppointment)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should delete an appointment', async () => {
    await deleteAppointment.onEvent!({
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

    expect(mockGetSdkReturn.deleteAppointment).toHaveBeenCalledWith({
      id: 'appointment-1',
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
