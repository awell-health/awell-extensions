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
        chunkCount: '1',
        entryCount: '2',
      },
    })
  })

  test('Should declare only the data points it returns', () => {
    expect(Object.keys(executeStoredBundle.dataPoints ?? {}).sort()).toEqual([
      'bundleId',
      'bundleType',
      'chunkCount',
      'entryCount',
    ])
  })

  // What Medplum did with each resource would grow with the bundle: a result
  // with an entry per resource can itself be larger than a NATS message.
  test('Should return a small result however many resources the bundle creates', async () => {
    const entries = Array.from({ length: 30_000 }, (_, i) => ({
      response: {
        status: '201 Created',
        location: `Observation/observation-${i}/_history/1`,
      },
    }))
    mockExecuteBatch.mockResolvedValue({ ...transactionResponse, entry: entries })
    const ref = await helpers.objectStore.put(
      'bundle.json',
      JSON.stringify(transaction),
    )

    await run(ref)

    expect(onError).not.toHaveBeenCalled()
    expect(JSON.stringify(onComplete.mock.calls[0][0]).length).toBeLessThan(200)
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

  describe('a bundle that was split into chunks', () => {
    const chunkOf = (n: number): typeof transaction => ({
      ...transaction,
      entry: [
        {
          resource: { resourceType: 'Observation', status: 'final', code: { text: `chunk ${n}` } },
          request: { method: 'PUT', url: `Observation?identifier=x|${n}` },
        },
      ] as never,
    })

    const manifestOf = (chunks: Array<{ ref: string; first?: number; last?: number }>): Record<string, unknown> => ({
      kind: 'transaction-chunks',
      version: 1,
      sourceBundleId: 'source-1',
      sourceRef: 'memory://source.json',
      totalEntries: chunks.length,
      chunks: chunks.map((chunk, i) => ({
        ref: chunk.ref,
        entries: 1,
        rank: 0,
        firstSourceEntry: chunk.first ?? i * 10,
        lastSourceEntry: chunk.last ?? i * 10 + 9,
        bytes: 100,
      })),
    })

    /** Stores `count` chunks and a manifest listing them, returning the manifest's reference. */
    const storeChunks = async (count: number): Promise<{ manifestRef: string; refs: string[] }> => {
      const refs: string[] = []
      for (let n = 1; n <= count; n++) {
        refs.push(await helpers.objectStore.put(`chunks/${n}.json`, JSON.stringify(chunkOf(n))))
      }
      const manifestRef = await helpers.objectStore.put(
        'chunks/manifest.json',
        JSON.stringify(manifestOf(refs.map((ref) => ({ ref })))),
      )
      return { manifestRef, refs }
    }

    test('Should execute each chunk, in the order the manifest lists them, and report what it did', async () => {
      mockExecuteBatch.mockResolvedValue(transactionResponse)
      const { manifestRef, refs } = await storeChunks(3)

      await run(manifestRef)

      expect(onError).not.toHaveBeenCalled()
      expect(mockExecuteBatch.mock.calls.map(([bundle]) => bundle.entry[0].resource.code.text)).toEqual([
        'chunk 1',
        'chunk 2',
        'chunk 3',
      ])
      expect(helpers.objectStore.get).toHaveBeenCalledWith(refs[2])
      expect(onComplete).toHaveBeenCalledWith({
        data_points: { bundleId: '', bundleType: 'transaction', chunkCount: '3', entryCount: '3' },
      })
    })

    test('Should send one chunk at a time: a later one may refer to what an earlier one wrote', async () => {
      let active = 0
      let overlapped = false
      mockExecuteBatch.mockImplementation(async () => {
        active++
        if (active > 1) overlapped = true
        await new Promise((resolve) => setTimeout(resolve, 5))
        active--
        return transactionResponse
      })
      const { manifestRef } = await storeChunks(5)

      await run(manifestRef)

      expect(overlapped).toBe(false)
      expect(mockExecuteBatch).toHaveBeenCalledTimes(5)
    })

    test('Should stop at the first chunk Medplum rejects, and say which one, from where in the source, and how far it got', async () => {
      mockExecuteBatch
        .mockResolvedValueOnce(transactionResponse)
        .mockRejectedValueOnce(new Error('Conditional reference matched nothing'))
      const refs: string[] = []
      for (let n = 1; n <= 4; n++) {
        refs.push(await helpers.objectStore.put(`c/${n}.json`, JSON.stringify(chunkOf(n))))
      }
      const manifestRef = await helpers.objectStore.put(
        'c/manifest.json',
        JSON.stringify(
          manifestOf([
            { ref: refs[0], first: 0, last: 199 },
            { ref: refs[1], first: 200, last: 399 },
            { ref: refs[2], first: 400, last: 599 },
            { ref: refs[3], first: 600, last: 799 },
          ]),
        ),
      )

      await run(manifestRef)

      expect(onComplete).not.toHaveBeenCalled()
      // The later chunks are not sent: carrying on could write what depends on what was not written.
      expect(mockExecuteBatch).toHaveBeenCalledTimes(2)
      const message = JSON.stringify(onError.mock.calls[0][0])
      expect(message).toContain('chunk 2 of 4')
      expect(message).toContain(refs[1])
      expect(message).toContain('source entries 200-399')
      expect(message).toContain('Conditional reference matched nothing')
      expect(message).toContain('1 of 4 chunks had been executed')
    })

    test('Should say which chunk, not quote it, when a stored chunk is not a transaction bundle', async () => {
      const bad = await helpers.objectStore.put(
        'c/bad.json',
        JSON.stringify({ resourceType: 'Bundle', type: 'collection', entry: [{ resource: { resourceType: 'Patient', name: [{ family: 'Smith' }] } }] }),
      )
      const manifestRef = await helpers.objectStore.put(
        'c/manifest.json',
        JSON.stringify(manifestOf([{ ref: bad }])),
      )

      await run(manifestRef)

      expect(mockExecuteBatch).not.toHaveBeenCalled()
      const message = JSON.stringify(onError.mock.calls[0][0])
      expect(message).toContain('chunk 1 of 1')
      expect(message).toContain('is not a transaction or batch Bundle')
      expect(message).not.toContain('Smith')
    })

    test('Should say which chunk when it cannot be read', async () => {
      const manifestRef = await helpers.objectStore.put(
        'c/manifest.json',
        JSON.stringify(manifestOf([{ ref: 'memory://c/missing.json' }])),
      )

      await run(manifestRef)

      expect(mockExecuteBatch).not.toHaveBeenCalled()
      const message = JSON.stringify(onError.mock.calls[0][0])
      expect(message).toContain('chunk 1 of 1')
      expect(message).toContain('missing.json')
    })

    test.each([
      ['a version it does not know', { version: 2 }],
      ['no chunks list', { chunks: undefined }],
      ['a chunk with no reference', { chunks: [{ entries: 1 }] }],
    ])('Should refuse a manifest with %s, without quoting it', async (_name, change) => {
      const manifestRef = await helpers.objectStore.put(
        'c/manifest.json',
        JSON.stringify({ ...manifestOf([{ ref: 'memory://x' }]), ...change, secret: 'Smith' }),
      )

      await run(manifestRef)

      expect(mockExecuteBatch).not.toHaveBeenCalled()
      const message = JSON.stringify(onError.mock.calls[0][0])
      expect(message).toContain('is not a valid manifest of transaction chunks')
      expect(message).not.toContain('Smith')
    })

    test('Should complete, having sent nothing, for a manifest with no chunks', async () => {
      const manifestRef = await helpers.objectStore.put('c/manifest.json', JSON.stringify(manifestOf([])))

      await run(manifestRef)

      expect(mockExecuteBatch).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith({
        data_points: { bundleId: '', bundleType: 'transaction', chunkCount: '0', entryCount: '0' },
      })
    })

    test('Should log what it is doing, without a word of what is in the bundle', async () => {
      mockExecuteBatch.mockResolvedValue(transactionResponse)
      const { manifestRef } = await storeChunks(2)

      await run(manifestRef)

      const logged = JSON.stringify((helpers.log as jest.Mock).mock.calls)
      expect(logged).toContain('chunk')
      expect(logged).not.toContain('Observation')
      expect(logged).not.toContain('"code"')
    })

    test('Should read a chunk only when it is about to send it, not all of them first', async () => {
      mockExecuteBatch.mockResolvedValue(transactionResponse)
      const { manifestRef } = await storeChunks(4)
      ;(helpers.objectStore.get as jest.Mock).mockClear()
      const readsAtEachSend: number[] = []
      mockExecuteBatch.mockImplementation(async () => {
        readsAtEachSend.push((helpers.objectStore.get as jest.Mock).mock.calls.length)
        return transactionResponse
      })

      await run(manifestRef)

      expect(onError).not.toHaveBeenCalled()
      // The manifest and the chunk about to go: not every chunk read up front.
      expect(readsAtEachSend).toEqual([2, 3, 4, 5])
    })
  })
})
