import fs from 'fs'
import path from 'path'
import { assertValidExtensionKey, isValidExtensionKey } from './extensionKey'

describe('extension key validation', () => {
  test('every existing extension directory is accepted (no regression for real keys)', () => {
    const dirs = fs
      .readdirSync(path.join(__dirname, '..', '..', 'extensions'), {
        withFileTypes: true,
      })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    expect(dirs.length).toBeGreaterThan(0)
    for (const dir of dirs) {
      expect(isValidExtensionKey(dir)).toBe(true)
    }
  })

  test.each(['acmeHealth', 'external-server', 'hello-world', 'a1_b2'])(
    'accepts %s',
    (key) => {
      expect(assertValidExtensionKey(key)).toBe(key)
    },
  )

  test.each([
    '..',
    '../../etc',
    '..%2F..',
    '/tmp/abs',
    'foo/bar',
    'foo\\bar',
    '.hidden',
    '1starts-with-digit',
    'has space',
    '',
  ])('rejects %p', (key) => {
    expect(() => assertValidExtensionKey(key)).toThrow(/Invalid extension key/)
  })
})
