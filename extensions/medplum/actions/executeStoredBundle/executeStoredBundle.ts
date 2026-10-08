import { Category, type Action, type Helpers } from '@awell-health/extensions-core'
import { type Bundle } from '@medplum/fhirtypes'
import { type MedplumClient } from '@medplum/core'
import { type settings } from '../../settings'
import { summarizeBundleResult, validateAndCreateSdkClient } from '../../utils'
import {
  ChunkManifestSchema,
  TRANSACTION_CHUNKS_KIND,
  fields,
  dataPoints,
  FieldsValidationSchema,
  type ChunkManifest,
} from './config'

/**
 * The bundle is PHI: an error that quotes a malformed one would put it in an
 * activity event, so say that it is not JSON and nothing more.
 */
const parseStored = (stored: string, ref: string): unknown => {
  try {
    return JSON.parse(stored)
  } catch {
    throw new Error(`The object at ${ref} is not valid JSON`)
  }
}

const asExecutableBundle = (value: unknown, ref: string): Bundle => {
  const bundle = value as Bundle | undefined
  if (bundle?.resourceType !== 'Bundle') {
    throw new Error(`The object at ${ref} is not a FHIR Bundle`)
  }
  // Medplum rejects any other type, but only after being sent it: and the
  // raw Metriport `bundleRef` is a collection, an easy one to wire in by mistake.
  if (bundle.type !== 'transaction' && bundle.type !== 'batch') {
    throw new Error(`The object at ${ref} is not a transaction or batch Bundle`)
  }
  return bundle
}

/** What says a stored object is a list of chunks and not a bundle: whether it is a valid one is another question. */
const isChunkManifest = (value: unknown): value is { kind: typeof TRANSACTION_CHUNKS_KIND } =>
  typeof value === 'object' &&
  value !== null &&
  (value as { kind?: unknown }).kind === TRANSACTION_CHUNKS_KIND

interface Executed {
  /** The id of Medplum's result, for one bundle: each chunk has its own, and none stands for all. */
  bundleId?: string
  bundleType: string
  chunkCount: number
  entryCount: number
}

/**
 * A bundle that was split: each chunk is read when it is about to be sent and
 * is sent on its own, one after another. A chunk may refer, by a conditional
 * reference, to what an earlier one wrote, so they are not sent together; and
 * the first that fails ends it, as what comes after may depend on what did not
 * get written. The ones that were executed stay in Medplum, and each was
 * written so that sending it again replaces what it wrote.
 */
const executeChunks = async ({
  manifest,
  bundleRef,
  medplumSdk,
  helpers,
}: {
  manifest: ChunkManifest
  bundleRef: string
  medplumSdk: MedplumClient
  helpers: Helpers
}): Promise<Executed> => {
  const total = manifest.chunks.length
  let entryCount = 0

  helpers.log({ bundleRef, chunks: total }, '[executeStoredBundle] Executing Medplum bundle in chunks')

  for (const [index, chunk] of manifest.chunks.entries()) {
    const position = `chunk ${index + 1} of ${total}`
    try {
      const bundle = asExecutableBundle(
        parseStored(await helpers.objectStore.get(chunk.ref), chunk.ref),
        chunk.ref,
      )
      await medplumSdk.executeBatch(bundle)
      entryCount += bundle.entry?.length ?? 0
      helpers.log(
        { bundleRef, chunk: index + 1, chunks: total, entries: bundle.entry?.length ?? 0 },
        `[executeStoredBundle] Executed ${position}`,
      )
    } catch (error) {
      const source =
        chunk.firstSourceEntry !== undefined && chunk.lastSourceEntry !== undefined
          ? `, source entries ${chunk.firstSourceEntry}-${chunk.lastSourceEntry}`
          : ''
      throw new Error(
        `${position} (${chunk.ref}${source}) failed: ${(error as Error).message}. ` +
          `${index} of ${total} chunks had been executed and stay in Medplum`,
      )
    }
  }

  // What the chunks are written as: a transaction each.
  return { bundleType: 'transaction', chunkCount: total, entryCount }
}

export const executeStoredBundle: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'executeStoredBundle',
  category: Category.EHR_INTEGRATIONS,
  title: 'Execute stored bundle',
  description:
    'Executes a FHIR Bundle (transaction or batch) in Medplum, reading it from a reference instead of from a field. Use it in place of "Find or create resource" when the bundle is too large to pass between care flow steps, such as one stored by the Metriport "Store Webhook Bundle" action. A bundle that was split into chunks is executed chunk by chunk, in order, and stops at the first chunk Medplum rejects.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { fields: input, medplumSdk } = await validateAndCreateSdkClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const stored = parseStored(
        await helpers.objectStore.get(input.bundleRef),
        input.bundleRef,
      )

      let executed: Executed
      if (isChunkManifest(stored)) {
        const manifest = ChunkManifestSchema.safeParse(stored)
        if (!manifest.success) {
          throw new Error(
            `The object at ${input.bundleRef} is not a valid manifest of transaction chunks`,
          )
        }
        executed = await executeChunks({
          manifest: manifest.data,
          bundleRef: input.bundleRef,
          medplumSdk,
          helpers,
        })
      } else {
        const bundle = asExecutableBundle(stored, input.bundleRef)

        // The bundle can be megabytes of PHI: log what it is, not what is in it.
        helpers.log(
          {
            bundleRef: input.bundleRef,
            bundleType: bundle.type,
            entries: bundle.entry?.length ?? 0,
          },
          '[executeStoredBundle] Executing Medplum bundle',
        )

        const result = await medplumSdk.executeBatch(bundle)
        executed = {
          ...summarizeBundleResult(result),
          chunkCount: 1,
          entryCount: bundle.entry?.length ?? 0,
        }
      }

      // Not what Medplum did with each resource: that grows with the bundle, and
      // a bundle too large to pass between steps can be answered by one too large.
      await onComplete({
        data_points: {
          ...(executed.bundleId !== undefined ? { bundleId: executed.bundleId } : {}),
          bundleType: executed.bundleType,
          chunkCount: String(executed.chunkCount),
          entryCount: String(executed.entryCount),
        },
      })
    } catch (error) {
      const message = `Failed to execute bundle: ${(error as Error).message}`
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: message },
            error: { category: 'SERVER_ERROR', message },
          },
        ],
      })
    }
  },
}
