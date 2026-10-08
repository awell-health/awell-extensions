import v8 from 'v8'
import vm from 'vm'

// A collection first, so that what is measured is what is still held and not what is waiting to be collected.
v8.setFlagsFromString('--expose-gc')
const collectGarbage = vm.runInNewContext('gc') as () => void

/**
 * Memory that is still held, as a test sees it: what the process holds after a
 * full collection. Measured against what a test starts from and the lowest it
 * reaches, not against an absolute figure, which depends on what else the worker
 * has run.
 *
 * Off-heap memory (the bytes of a Buffer) is freed after a collection by a later
 * task, so right after one it can still count what is already garbage. Count it
 * where Buffers are what is being held, and leave it out where it is objects.
 */
export const retainedMemory = ({
  includeExternal = true,
}: { includeExternal?: boolean } = {}): { sample: () => void; growth: () => number } => {
  let lowest = Infinity
  let peak = 0
  return {
    sample: () => {
      collectGarbage()
      const { heapUsed, external } = process.memoryUsage()
      const held = includeExternal ? heapUsed + external : heapUsed
      lowest = Math.min(lowest, held)
      peak = Math.max(peak, held)
    },
    /** How much more was held at the most than at the least. */
    growth: () => peak - lowest,
  }
}
