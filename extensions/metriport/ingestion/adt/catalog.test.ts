import { codingOf, codingsOf, toCoding } from './catalog'

describe('catalog codings', () => {
  test('keeps a coding with a system and a code, with its display when it has one', () => {
    expect(toCoding({ system: 'urn:s', code: 'A', display: 'Ay' })).toEqual({
      system: 'urn:s',
      code: 'A',
      display: 'Ay',
    })
    expect(toCoding({ system: 'urn:s', code: 'A' })).toEqual({
      system: 'urn:s',
      code: 'A',
    })
  })

  test.each([
    [{ code: 'A' }],
    [{ system: 'urn:s' }],
    [{ system: '', code: 'A' }],
    [{ system: 'urn:s', code: '' }],
    [undefined],
  ])('drops %j: the catalog requires a system and a code', (coding) => {
    expect(toCoding(coding)).toBeUndefined()
  })

  test('answers nothing, never an empty list, when no coding fits', () => {
    expect(
      codingsOf([{ text: 'Chest pain' }, { coding: [{ code: 'x' }] }]),
    ).toBe(undefined)
    expect(codingsOf(undefined)).toBeUndefined()
    expect(codingOf(undefined)).toBeUndefined()
  })
})
