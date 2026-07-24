import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { checkPatientTag } from '../checkPatientTag'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('checkPatientTag action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(checkPatientTag)

  beforeAll(() => {
    const mockSdk = getSdk as jest.Mock
    mockSdk.mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  describe('when tag is applied', () => {
    it('should return call onComplete with hasTag data points set to true', async () => {
      await checkPatientTag.onEvent!({
        payload: generateTestPayload({
          fields: {
            id: 'tag-1',
            patientId: 'patient-1',
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

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hasTag: 'true',
        },
      })
    })
  })
  describe('when tag is not applied', () => {
    it('should return call onComplete with hasTag data points set to false', async () => {
      await checkPatientTag.onEvent!({
        payload: generateTestPayload({
          fields: {
            id: 'no-tag',
            patientId: 'patient-1',
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

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hasTag: 'false',
        },
      })
    })
  })
})
