import { orderByDependency } from './order'

const graph = (edges: Record<string, string[]>): Map<string, string[]> =>
  new Map(Object.entries(edges))

describe('Metriport - orderByDependency', () => {
  test('Should rank what depends on nothing first', () => {
    const { ranks } = orderByDependency(graph({ a: [], b: [], c: [] }))

    expect([...ranks.values()]).toEqual([0, 0, 0])
  })

  test('Should rank a resource after every resource it refers to', () => {
    // obs refers to enc, and enc refers to org and practitioner.
    const { ranks } = orderByDependency(
      graph({ obs: ['enc'], enc: ['org', 'prac'], org: [], prac: [] }),
    )

    expect(ranks.get('org')).toBe(0)
    expect(ranks.get('prac')).toBe(0)
    expect(ranks.get('enc')).toBe(1)
    expect(ranks.get('obs')).toBe(2)
  })

  test('Should rank after the deepest of several dependencies', () => {
    const { ranks } = orderByDependency(graph({ a: ['b', 'c'], b: ['c'], c: [] }))

    expect(ranks.get('c')).toBe(0)
    expect(ranks.get('b')).toBe(1)
    expect(ranks.get('a')).toBe(2)
  })

  test('Should ignore a reference to something that is not in the bundle', () => {
    const { ranks } = orderByDependency(graph({ a: ['elsewhere'] }))

    expect(ranks.get('a')).toBe(0)
    expect(ranks.has('elsewhere')).toBe(false)
  })

  test('Should ignore a reference to itself', () => {
    expect(orderByDependency(graph({ a: ['a'] })).ranks.get('a')).toBe(0)
  })

  describe('a cycle', () => {
    test('Should put the resources of a cycle in one group, at one rank, and finish', () => {
      const { ranks, groups } = orderByDependency(graph({ a: ['b'], b: ['c'], c: ['a'], d: ['a'] }))

      expect(groups.get('a')).toBeDefined()
      expect(groups.get('b')).toBe(groups.get('a'))
      expect(groups.get('c')).toBe(groups.get('a'))
      expect(ranks.get('b')).toBe(ranks.get('a'))
      expect(ranks.get('c')).toBe(ranks.get('a'))
      // What refers into the cycle comes after it, and is not in it.
      expect(ranks.get('d')).toBe((ranks.get('a') as number) + 1)
      expect(groups.has('d')).toBe(false)
    })

    test('Should group an encounter and its diagnoses, which refer to each other, and rank what they refer to before them', () => {
      const { ranks, groups } = orderByDependency(
        graph({
          enc: ['org', 'cond1', 'cond2'],
          cond1: ['enc'],
          cond2: ['enc'],
          org: [],
          obs: ['enc', 'cond1'],
        }),
      )

      expect(new Set([groups.get('enc'), groups.get('cond1'), groups.get('cond2')]).size).toBe(1)
      expect(ranks.get('org')).toBe(0)
      expect(ranks.get('enc')).toBe(1)
      expect(ranks.get('obs')).toBe(2)
    })

    test('Should keep two separate cycles in separate groups', () => {
      const { groups } = orderByDependency(graph({ a: ['b'], b: ['a'], c: ['d'], d: ['c'] }))

      expect(groups.get('a')).toBe(groups.get('b'))
      expect(groups.get('c')).toBe(groups.get('d'))
      expect(groups.get('a')).not.toBe(groups.get('c'))
    })

    test('Should not make a group of a resource that only refers to itself', () => {
      expect(orderByDependency(graph({ a: ['a'] })).groups.has('a')).toBe(false)
    })
  })

  test('Should not overflow the stack on a very long chain', () => {
    const edges: Record<string, string[]> = {}
    const length = 100_000
    for (let i = 0; i < length; i++) edges[`n${i}`] = i === 0 ? [] : [`n${i - 1}`]

    const { ranks } = orderByDependency(graph(edges))

    expect(ranks.get(`n${length - 1}`)).toBe(length - 1)
  })

  test('Should give the same ranks to the same bundle every time', () => {
    const edges = { a: ['b'], b: ['c', 'd'], c: ['d'], d: [], e: ['a', 'c'] }

    expect(JSON.stringify(orderByDependency(graph(edges)))).toEqual(JSON.stringify(orderByDependency(graph(edges))))
  })
})
