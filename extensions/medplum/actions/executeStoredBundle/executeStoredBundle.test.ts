import { TestHelpers } from '@awell-health/extensions-core'
import { MedplumClient } from '@medplum/core'
import { executeStoredBundle } from './executeStoredBundle'

jest.mock('@medplum/core')

const NATS_MAX_PAYLOAD = 5 * 1024 * 1024

const transaction = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: { resourceType: 'Patient', name: [{ family: 'Smith' }] },
      request: { method: 'POST', url: 'Patient' },
    },
    {
      resource: { resourceType: 'Observation', status: 'final' },
      request: { method: 'POST', url: 'Observation' },
    },
  ],
}

const transactionResponse = {
  resourceType: 'Bundle',
  type: 'transaction-response',
  id: 'bundle-123',
  entry: [
    {
      response: {
        status: '201 Created',
        location: 'Patient/patient-1/_history/1',
      },
    },
    {
      response: {
        status: '201 Created',
        location: 'Observation/observation-2/_history/1',
      },
    },
  ],
}

describe('Medplum - Execute stored bundle', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(executeStoredBundle)

  const mockExecuteBatch = jest.fn()

  const run = async (bundleRef: string): Promise<void> => {
    await extensionAction.onEvent({
      payload: {
        fields: { bundleRef },
        pathway: { id: 'some-pathway-id' },
        activity: { id: 'some-activity-id' },
        settings: {
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          baseUrl: '',
        },
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
  }

  beforeAll(() => {
    jest.mocked(MedplumClient).mockImplementation(() => {
      return {
        startClientLogin: jest.fn(),
        executeBatch: mockExecuteBatch,
      } as unknown as MedplumClient
    })
  })

  beforeEach(() => {
    clearMocks()
    mockExecuteBatch.mockReset()
  })

  test('Should have the correct key', () => {
    expect(executeStoredBundle.key).toBe('executeStoredBundle')
  })

  test('Should execute the bundle the reference points at', async () => {
    mockExecuteBatch.mockResolvedValue(transactionResponse)
    const ref = await helpers.objectStore.put(
      'bundle.json',
      JSON.stringify(transaction),
    )

    await run(ref)

    expect(helpers.objectStore.get).toHaveBeenCalledWith(ref)
    expect(mockExecuteBatch).toHaveBeenCalledWith(transaction)
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        bundleId: 'bundle-123',
        bundleType: 'transaction-response',
        resourceIds: 'patient-1,observation-2',
        resourcesCreated: JSON.stringify([
          {
            id: 'patient-1',
            resourceType: 'Patient',
            status: '201 Created',
            location: 'Patient/patient-1',
          },
          {
            id: 'observation-2',
            resourceType: 'Observation',
            status: '201 Created',
            location: 'Observation/observation-2',
          },
        ]),
      },
    })
  })

  test('Should execute a bundle too large to pass between care flow steps', async () => {
    mockExecuteBatch.mockResolvedValue(transactionResponse)
    const huge = {
      ...transaction,
      entry: [
        ...transaction.entry,
        {
          resource: {
            resourceType: 'Binary',
            contentType: 'text/html',
            data: 'x'.repeat(NATS_MAX_PAYLOAD + 1),
          },
          request: { method: 'POST', url: 'Binary' },
        },
      ],
    }
    const ref = await helpers.objectStore.put('bundle.json', JSON.stringify(huge))

    await run(ref)

    expect(onError).not.toHaveBeenCalled()
    expect(mockExecuteBatch).toHaveBeenCalledWith(huge)
  })

  test('Should not write the bundle to the log', async () => {
    mockExecuteBatch.mockResolvedValue(transactionResponse)
    const ref = await helpers.objectStore.put(
      'bundle.json',
      JSON.stringify(transaction),
    )

    await run(ref)

    expect(JSON.stringify((helpers.log as jest.Mock).mock.calls)).not.toContain(
      'Smith',
    )
  })

  test('Should call onError when the reference does not resolve', async () => {
    await run('no-such-reference')

    expect(mockExecuteBatch).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'no-such-reference',
    )
  })

  test('Should call onError, without quoting the object, when the stored object is not JSON', async () => {
    const ref = await helpers.objectStore.put(
      'bundle.json',
      '{"resourceType":"Patient","name":[{"family":"Smith"}] oops',
    )

    await run(ref)

    expect(mockExecuteBatch).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain('is not valid JSON')
    expect(JSON.stringify(onError.mock.calls[0][0])).not.toContain('Smith')
  })

  test.each(['collection', 'searchset', 'document'])(
    'Should call onError when the stored Bundle is a %s, which Medplum cannot execute',
    async (type) => {
      const ref = await helpers.objectStore.put(
        'bundle.json',
        JSON.stringify({ resourceType: 'Bundle', type, entry: [] }),
      )

      await run(ref)

      expect(mockExecuteBatch).not.toHaveBeenCalled()
      expect(onComplete).not.toHaveBeenCalled()
      expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
        'is not a transaction or batch Bundle',
      )
    },
  )

  test('Should execute a batch Bundle as well', async () => {
    mockExecuteBatch.mockResolvedValue(transactionResponse)
    const batch = { ...transaction, type: 'batch' }
    const ref = await helpers.objectStore.put('bundle.json', JSON.stringify(batch))

    await run(ref)

    expect(onError).not.toHaveBeenCalled()
    expect(mockExecuteBatch).toHaveBeenCalledWith(batch)
  })

  test('Should call onError when the stored object is not a Bundle', async () => {
    const ref = await helpers.objectStore.put(
      'patient.json',
      JSON.stringify({ resourceType: 'Patient' }),
    )

    await run(ref)

    expect(mockExecuteBatch).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'is not a FHIR Bundle',
    )
  })

  test('Should call onError when Medplum rejects the bundle', async () => {
    mockExecuteBatch.mockRejectedValue(new Error('Conditional reference failed'))
    const ref = await helpers.objectStore.put(
      'bundle.json',
      JSON.stringify(transaction),
    )

    await run(ref)

    expect(onComplete).not.toHaveBeenCalled()
    expect(JSON.stringify(onError.mock.calls[0][0])).toContain(
      'Conditional reference failed',
    )
  })
})
