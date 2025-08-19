import { generateTestPayload } from './constants'
import { deploymentStatusSnapshot } from '../extensions/apigee/actions'
import { ApigeeApiClient } from '../extensions/apigee/client'

jest.mock('../extensions/apigee/client')

describe('Apigee - deploymentStatusSnapshot', () => {
  const mockedApigeeApiClient = jest.mocked(ApigeeApiClient)
  const mockDeploymentStatusSnapshot = jest.fn()
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    mockedApigeeApiClient.mockImplementation(() => ({
      deploymentStatusSnapshot: mockDeploymentStatusSnapshot,
    } as any))
  })

  test('Should provide deployment status snapshot', async () => {
    mockDeploymentStatusSnapshot.mockResolvedValue({
      snapshots: [
        {
          proxy: 'proxy1',
          revision: '2',
          environments: [
            { name: 'prod', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' },
            { name: 'test', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' }
          ]
        },
        {
          proxy: 'proxy2',
          revision: '1',
          environments: [
            { name: 'prod', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' }
          ]
        }
      ]
    })

    const payload = generateTestPayload({
      fields: {},
      settings: {
        gcpProjectId: 'test-project',
        apigeeOrgId: 'test-org',
        credentialsStrategy: 'adc'
      }
    })

    await deploymentStatusSnapshot.onActivityCreated!(payload, onComplete, onError)

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        snapshots: JSON.stringify([
          {
            proxy: 'proxy1',
            revision: '2',
            environments: [
              { name: 'prod', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' },
              { name: 'test', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' }
            ]
          },
          {
            proxy: 'proxy2',
            revision: '1',
            environments: [
              { name: 'prod', state: 'deployed', lastChange: '2023-01-01T00:00:00Z' }
            ]
          }
        ]),
        snapshotCount: '2',
        organizationId: 'test-org'
      }
    })
  })
})
