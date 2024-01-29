import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk } from '../../gql/__mocks__/sdk'
import { checkPatientTag } from '../checkPatientTag'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('checkPatientTag action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    const mockSdk = getSdk as jest.Mock
    mockSdk.mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when tag is applied', () => {
    it('should return call onComplete with hasTag data points set to true', async () => {
      await checkPatientTag.onActivityCreated(
        generateTestPayload({
          fields: {
            id: 'tag-1',
            patientId: 'patient-1',
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        }),
        onComplete,
        jest.fn()
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hasTag: 'true',
        },
      })
    })
  })
  describe('when tag is not applied', () => {
    it('should return call onComplete with hasTag data points set to false', async () => {
      await checkPatientTag.onActivityCreated(
        generateTestPayload({
          fields: {
            id: 'no-tag',
            patientId: 'patient-1',
          },
          settings: {
            apiKey: 'apiKey',
            apiUrl: 'test-url',
          },
        }),
        onComplete,
        jest.fn()
      )

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          hasTag: 'false',
        },
      })
    })
  })
})
