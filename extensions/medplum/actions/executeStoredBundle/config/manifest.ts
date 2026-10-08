import { z } from 'zod'

/**
 * The shape `Store Webhook Bundle` gives a bundle it has split into chunks: a
 * list of the stored transaction bundles to execute, in order. Defined here, as
 * what this action accepts, and not imported from the extension that writes it.
 */
export const TRANSACTION_CHUNKS_KIND = 'transaction-chunks'

export const ChunkManifestSchema = z.object({
  kind: z.literal(TRANSACTION_CHUNKS_KIND),
  version: z.literal(1),
  chunks: z.array(
    z.object({
      ref: z.string().min(1),
      /** Where in the source bundle the chunk's entries came from, to say so when it fails. */
      firstSourceEntry: z.number().int().nonnegative().optional(),
      lastSourceEntry: z.number().int().nonnegative().optional(),
    }),
  ),
})

export type ChunkManifest = z.infer<typeof ChunkManifestSchema>
