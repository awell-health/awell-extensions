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
 */
export const retainedMemory = (): { sample: () => void; growth: () => number } => {
  let lowest = Infinity
  let peak = 0
  return {
    sample: () => {
      collectGarbage()
      const { heapUsed, external } = process.memoryUsage()
      const held = heapUsed + external
      lowest = Math.min(lowest, held)
      peak = Math.max(peak, held)
    },
    /** How much more was held at the most than at the least. */
    growth: () => peak - lowest,
  }
}
