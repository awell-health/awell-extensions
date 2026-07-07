import { classifyErrorCategory } from './output'

describe('classifyErrorCategory', () => {
  it('classifies SERVER_ERROR as transient and retryable', () => {
    const r = classifyErrorCategory('SERVER_ERROR')
    expect(r.errorClass).toBe('transient')
    expect(r.isRetryable).toBe(true)
  })

  it.each([
    ['WRONG_INPUT', 'validation'],
    ['WRONG_DATA', 'validation'],
    ['MISSING_FIELDS', 'validation'],
    ['MISSING_SETTINGS', 'config'],
    ['BAD_REQUEST', 'business'],
  ])('classifies %s as %s and non-retryable', (category, errorClass) => {
    const r = classifyErrorCategory(category)
    expect(r.errorClass).toBe(errorClass)
    expect(r.isRetryable).toBe(false)
  })

  it('falls back to a non-retryable business class for unknown categories', () => {
    const r = classifyErrorCategory('SOMETHING_ELSE')
    expect(r.errorClass).toBe('business')
    expect(r.isRetryable).toBe(false)
  })

  it('treats only SERVER_ERROR as retryable across the known taxonomy', () => {
    const categories = [
      'SERVER_ERROR',
      'WRONG_INPUT',
      'WRONG_DATA',
      'MISSING_FIELDS',
      'MISSING_SETTINGS',
      'BAD_REQUEST',
    ]
    const retryable = categories.filter(
      (c) => classifyErrorCategory(c).isRetryable,
    )
    expect(retryable).toEqual(['SERVER_ERROR'])
  })
})
