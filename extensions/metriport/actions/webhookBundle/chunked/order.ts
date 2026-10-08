export interface DependencyOrder {
  /**
   * The order resources can be written in, as a rank for each: a resource is
   * ranked after everything it refers to, so that by the time its chunk is sent
   * every resource it points at has been written by an earlier one and a
   * conditional reference to it resolves.
   */
  ranks: Map<string, number>
  /**
   * The resources that refer to each other, in a cycle, each mapped to the id of
   * its group. An encounter and its diagnoses are one: the Encounter lists its
   * Conditions, and each Condition points back at the Encounter. A cycle cannot
   * be ordered, so it is not: its resources must be written together, in one
   * transaction, where their `urn:uuid` references resolve to each other. A
   * resource that is in no cycle is in no group.
   */
  groups: Map<string, number>
}

/**
 * Orders resources so that each is written after what it refers to.
 *
 * `dependencies` maps each resource to the resources it refers to. A reference
 * to something that is not a key is outside the bundle and is ignored, as is a
 * reference to itself. Resources in a cycle form one group and share a rank,
 * which is one past the highest rank of anything outside the group that any of
 * them refers to.
 *
 * Iterative (Tarjan's strongly connected components), because a chain of
 * references can be as long as the bundle.
 */
export const orderByDependency = (
  dependencies: ReadonlyMap<string, readonly string[]>,
): DependencyOrder => {
  const index = new Map<string, number>()
  const lowest = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const componentOf = new Map<string, number>()
  const components: string[][] = []
  let counter = 0

  const visit = (key: string): void => {
    index.set(key, counter)
    lowest.set(key, counter)
    counter++
    stack.push(key)
    onStack.add(key)
  }

  for (const start of dependencies.keys()) {
    if (index.has(start)) continue

    const work: Array<{ key: string; next: number }> = [{ key: start, next: 0 }]
    visit(start)

    while (work.length > 0) {
      const frame = work[work.length - 1]
      const targets = dependencies.get(frame.key) ?? []

      if (frame.next < targets.length) {
        const target = targets[frame.next++]
        if (!dependencies.has(target)) continue

        if (!index.has(target)) {
          visit(target)
          work.push({ key: target, next: 0 })
        } else if (onStack.has(target)) {
          lowest.set(
            frame.key,
            Math.min(lowest.get(frame.key) as number, index.get(target) as number),
          )
        }
        continue
      }

      work.pop()
      if (lowest.get(frame.key) === index.get(frame.key)) {
        const members: string[] = []
        let member: string
        do {
          member = stack.pop() as string
          onStack.delete(member)
          componentOf.set(member, components.length)
          members.push(member)
        } while (member !== frame.key)
        components.push(members)
      }
      const parent = work[work.length - 1]
      if (parent !== undefined) {
        lowest.set(
          parent.key,
          Math.min(lowest.get(parent.key) as number, lowest.get(frame.key) as number),
        )
      }
    }
  }

  // A component is complete after every component it refers to, so by the time
  // it is ranked the ranks of those are known.
  const componentRank: number[] = []
  for (const [component, members] of components.entries()) {
    let rank = 0
    for (const member of members) {
      for (const target of dependencies.get(member) ?? []) {
        const targetComponent = componentOf.get(target)
        if (targetComponent !== undefined && targetComponent !== component) {
          rank = Math.max(rank, componentRank[targetComponent] + 1)
        }
      }
    }
    componentRank.push(rank)
  }

  const ranks = new Map<string, number>()
  const groups = new Map<string, number>()
  for (const key of dependencies.keys()) {
    const component = componentOf.get(key) as number
    ranks.set(key, componentRank[component])
    if (components[component].length > 1) groups.set(key, component)
  }
  return { ranks, groups }
}
