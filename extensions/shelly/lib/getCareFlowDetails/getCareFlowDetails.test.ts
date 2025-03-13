import { getCareFlowDetails } from './getCareFlowDetails'
import { AwellSdk } from '@awell-health/awell-sdk'
import {
  mockPathwayDetailsSuccess,
  mockPathwayDetailsWithNonMatchingReleaseId,
  mockPathwayDetailsFailure,
  mockPublishedDefinitionsSuccess,
  mockPublishedDefinitionsWithSingleDefinition,
  mockPublishedDefinitionsFailure
} from './__mocks__'

// Set NODE_ENV to 'test' to suppress console.error logs
process.env.NODE_ENV = 'test'

jest.mock('@awell-health/awell-sdk', () => {
  return {
    AwellSdk: jest.fn().mockImplementation(() => ({
      orchestration: {
        query: jest.fn(),
      },
    })),
  }
})

describe('getCareFlowDetails', () => {
  let awellSdkMock: jest.Mocked<AwellSdk>
  
  beforeEach(() => {
    jest.clearAllMocks()

    awellSdkMock = new AwellSdk({
      apiKey: 'mock-api-key',
    }) as jest.Mocked<AwellSdk>
  })

  it('should return care flow details with version when release_id matches', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock pathway details response
    mockQuery.mockResolvedValueOnce(mockPathwayDetailsSuccess)

    // Mock published definitions response
    mockQuery.mockResolvedValueOnce(mockPublishedDefinitionsSuccess)

    const result = await getCareFlowDetails(awellSdkMock, 'test-pathway-id')

    expect(result).toEqual({
      title: 'Test Care Flow',
      id: 'test-definition-id',
      version: 6,
    })

    expect(mockQuery).toHaveBeenCalledTimes(2)
  })

  it('should return null version when no matching release_id is found', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock pathway details response
    mockQuery.mockResolvedValueOnce(mockPathwayDetailsWithNonMatchingReleaseId)

    // Mock published definitions response
    mockQuery.mockResolvedValueOnce(mockPublishedDefinitionsWithSingleDefinition)

    const result = await getCareFlowDetails(awellSdkMock, 'test-pathway-id')

    expect(result).toEqual({
      title: 'Test Care Flow',
      id: 'test-definition-id',
      version: null,
    })
  })

  it('should throw an error when pathway details fetch fails', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock pathway details response failure
    mockQuery.mockResolvedValueOnce(mockPathwayDetailsFailure)

    await expect(getCareFlowDetails(awellSdkMock, 'test-pathway-id')).rejects.toThrow(
      'Failed to fetch pathway details for pathway ID: test-pathway-id'
    )
  })

  it('should throw an error when published definitions fetch fails', async () => {
    const mockQuery = awellSdkMock.orchestration.query as jest.Mock

    // Mock pathway details response
    mockQuery.mockResolvedValueOnce(mockPathwayDetailsSuccess)

    // Mock published definitions response failure
    mockQuery.mockResolvedValueOnce(mockPublishedDefinitionsFailure)

    await expect(getCareFlowDetails(awellSdkMock, 'test-pathway-id')).rejects.toThrow(
      'Failed to fetch published pathway definitions'
    )
  })
}) 