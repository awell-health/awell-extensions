import { shouldDedupe } from './shouldDedupe'

describe('Metriport - shouldDedupe', () => {
  const ORIGINAL_AWELL_ENVIRONMENT = process.env.AWELL_ENVIRONMENT

  afterEach(() => {
    process.env.AWELL_ENVIRONMENT = ORIGINAL_AWELL_ENVIRONMENT
  })

  test.each(['production', 'production-eu', 'api-production'])(
    'Should dedupe when AWELL_ENVIRONMENT is "%s"',
    (environment) => {
      process.env.AWELL_ENVIRONMENT = environment

      expect(shouldDedupe()).toBe(true)
    },
  )

  test.each(['sandbox', 'staging', 'development', ''])(
    'Should not dedupe when AWELL_ENVIRONMENT is "%s"',
    (environment) => {
      process.env.AWELL_ENVIRONMENT = environment

      expect(shouldDedupe()).toBe(false)
    },
  )

  test('Should not dedupe when AWELL_ENVIRONMENT is unset', () => {
    delete process.env.AWELL_ENVIRONMENT

    expect(shouldDedupe()).toBe(false)
  })
})
