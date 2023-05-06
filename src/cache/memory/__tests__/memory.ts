import { InMemoryCache } from '../memory'
import { type CacheService } from '../../cache'

describe('In-memory token cache', () => {
  const key = 'test-key'
  const value = 'test-value'

  let cache: CacheService<string>

  beforeEach(() => {
    cache = new InMemoryCache({ maxEntries: 5 })
  })

  test('Should save and retrieve a value', async () => {
    await cache.set(key, value)

    const result = await cache.get(key)
    expect(result).toEqual(value)
  })

  test('Should properly unset keys', async () => {
    await cache.set(key, value)

    const result = await cache.get(key)
    expect(result).toEqual(value)

    await cache.unset(key)
    const secondResult = await cache.get(key)
    expect(secondResult).toBeNull()
  })

  test('Should properly expire keys', async () => {
    await cache.set(key, value, Date.now() + 2000)

    const result = await cache.get(key)
    expect(result).toEqual(value)

    await new Promise((resolve) => setTimeout(resolve, 3000))
    const secondResult = await cache.get(key)
    expect(secondResult).toBeNull()
  })

  test('Should evict keys if capacity is reached', async () => {
    const getKey = (i: number): string => `${key}-${i}`

    for (let i = 0; i <= 4; i++) {
      await cache.set(getKey(i), value)
    }

    // After this, 'test-key-0' will be least recently used and should be evicted when new key is inserted
    for (let i = 0; i <= 4; i++) {
      expect(await cache.get(getKey(i))).toEqual(value)
    }

    await cache.set(getKey(5), value)
    for (let i = 1; i <= 5; i++) {
      expect(await cache.get(getKey(i))).toEqual(value)
    }
    expect(await cache.get(getKey(0))).toBeNull()
  })
})
