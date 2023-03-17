import { getAllExtensionReadmes } from '..'

describe('getAllExtensionReadmes', () => {
  test('Should work', () => {
    const outcome = getAllExtensionReadmes()

    expect(Array.isArray(outcome)).toBe(true)
    outcome.forEach((el) => {
      expect(el).toHaveProperty('extensionKey')
      expect(typeof el.extensionKey).toBe('string')

      expect(el).toHaveProperty('html')
      expect(typeof el.html).toBe('string')
    })
  })
})
