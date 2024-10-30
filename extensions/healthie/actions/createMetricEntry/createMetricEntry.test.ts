import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { mockGetSdk } from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { createMetricEntry } from '../createMetricEntry'

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

  test('Should create a metric entry', async () => {
    await createMetricEntry.onActivityCreated!(
      generateTestPayload({
        fields: {
          userId: '60',
          type: 'MetricEntry',
          category: 'Weight',
          metricStat: 182,
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

  test('Should throw an error if the user ID is not provided', async () => {
    await createMetricEntry.onActivityCreated!(
      // @ts-expect-error - userId is missing for testing purposes
      generateTestPayload({
        fields: {
          // userId: '60',
          type: 'MetricEntry',
          category: 'Weight',
          metricStat: 182,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledTimes(0)
    expect(onError).toBeCalledTimes(1)
  })

  test('Should throw an error if the category is not provided', async () => {
    await createMetricEntry.onActivityCreated!(
      // @ts-expect-error - category is missing for testing purposes
      generateTestPayload({
        fields: {
          userId: '60',
          type: 'MetricEntry',
          // category: 'Weight',
          metricStat: 182,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledTimes(0)
    expect(onError).toBeCalledTimes(1)
  })

  test('Should throw an error if the metricStat is not provided', async () => {
    await createMetricEntry.onActivityCreated!(
      // @ts-expect-error - metricStat is missing for testing purposes
      generateTestPayload({
        fields: {
          userId: '60',
          type: 'MetricEntry',
          category: 'Weight',
          // metricStat: 182,
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledTimes(0)
    expect(onError).toBeCalledTimes(1)
  })
})
