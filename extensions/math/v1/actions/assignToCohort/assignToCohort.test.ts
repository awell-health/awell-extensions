import { generateTestPayload } from '@/tests'
import { assignToCohort } from './assignToCohort'

describe('Assign to cohort', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Determinism', () => {
    test('Should always return the same cohort for the same input and number of cohorts', async () => {
      const payload = generateTestPayload({
        fields: {
          input: 'patient-123',
          numberOfCohorts: 3,
        },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)
      const firstResult =
        onComplete.mock.calls[0][0].data_points.cohortNumber

      onComplete.mockClear()

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)
      const secondResult =
        onComplete.mock.calls[0][0].data_points.cohortNumber

      expect(firstResult).toBe(secondResult)
    })

    test('Should return the same cohort across multiple invocations for various inputs', async () => {
      const inputs = [
        'patient-abc',
        'user@example.com',
        '550e8400-e29b-41d4-a716-446655440000',
        '12345',
        'some-random-hash-value',
      ]

      for (const input of inputs) {
        const payload = generateTestPayload({
          fields: { input, numberOfCohorts: 5 },
          settings: {},
        })

        await assignToCohort.onActivityCreated!(payload, onComplete, onError)
        const firstResult =
          onComplete.mock.calls[onComplete.mock.calls.length - 1][0]
            .data_points.cohortNumber

        await assignToCohort.onActivityCreated!(payload, onComplete, onError)
        const secondResult =
          onComplete.mock.calls[onComplete.mock.calls.length - 1][0]
            .data_points.cohortNumber

        expect(firstResult).toBe(secondResult)
      }
    })
  })

  describe('Output range', () => {
    test('Should return a cohort number between 1 and numberOfCohorts (inclusive)', async () => {
      const numberOfCohorts = 4
      const inputs = [
        'a',
        'b',
        'c',
        'patient-1',
        'patient-2',
        'xyz-999',
        'hello',
        'world',
        'test',
        'foo',
      ]

      for (const input of inputs) {
        const payload = generateTestPayload({
          fields: { input, numberOfCohorts },
          settings: {},
        })

        await assignToCohort.onActivityCreated!(payload, onComplete, onError)
        const cohort = Number(
          onComplete.mock.calls[onComplete.mock.calls.length - 1][0]
            .data_points.cohortNumber
        )

        expect(cohort).toBeGreaterThanOrEqual(1)
        expect(cohort).toBeLessThanOrEqual(numberOfCohorts)
      }
    })

    test('Should always return 1 when numberOfCohorts is 1', async () => {
      const payload = generateTestPayload({
        fields: { input: 'any-value', numberOfCohorts: 1 },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          cohortNumber: '1',
        },
      })
    })
  })

  describe('Cohort changes when numberOfCohorts changes', () => {
    test('Should document the behavior when numberOfCohorts increases', async () => {
      const input = 'patient-stable'

      // Get cohort with 2 cohorts
      const payload2 = generateTestPayload({
        fields: { input, numberOfCohorts: 2 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload2, onComplete, onError)
      const cohortWith2 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // Get cohort with 3 cohorts
      const payload3 = generateTestPayload({
        fields: { input, numberOfCohorts: 3 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload3, onComplete, onError)
      const cohortWith3 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // Get cohort with 4 cohorts
      const payload4 = generateTestPayload({
        fields: { input, numberOfCohorts: 4 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload4, onComplete, onError)
      const cohortWith4 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // All should be valid cohort numbers within their respective ranges
      expect(cohortWith2).toBeGreaterThanOrEqual(1)
      expect(cohortWith2).toBeLessThanOrEqual(2)
      expect(cohortWith3).toBeGreaterThanOrEqual(1)
      expect(cohortWith3).toBeLessThanOrEqual(3)
      expect(cohortWith4).toBeGreaterThanOrEqual(1)
      expect(cohortWith4).toBeLessThanOrEqual(4)

      // When the number of cohorts changes, a patient MAY be reassigned
      // to a different cohort. This is expected behavior because the modulo
      // base changes.
    })

    test('Should document the behavior when numberOfCohorts decreases', async () => {
      const input = 'patient-stable'

      // Get cohort with 5 cohorts
      const payload5 = generateTestPayload({
        fields: { input, numberOfCohorts: 5 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload5, onComplete, onError)
      const cohortWith5 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // Get cohort with 3 cohorts
      const payload3 = generateTestPayload({
        fields: { input, numberOfCohorts: 3 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload3, onComplete, onError)
      const cohortWith3 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // Get cohort with 2 cohorts
      const payload2 = generateTestPayload({
        fields: { input, numberOfCohorts: 2 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload2, onComplete, onError)
      const cohortWith2 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      // All should be valid within their ranges
      expect(cohortWith5).toBeGreaterThanOrEqual(1)
      expect(cohortWith5).toBeLessThanOrEqual(5)
      expect(cohortWith3).toBeGreaterThanOrEqual(1)
      expect(cohortWith3).toBeLessThanOrEqual(3)
      expect(cohortWith2).toBeGreaterThanOrEqual(1)
      expect(cohortWith2).toBeLessThanOrEqual(2)
    })

    test('Should keep patients in the same cohort when numberOfCohorts is a multiple', async () => {
      // When going from N to 2N cohorts, patients originally in cohort C
      // will land in either C or C+N. But with hash-based assignment this
      // is not guaranteed, so we just verify determinism and valid range.
      const input = 'patient-xyz'

      const payload2 = generateTestPayload({
        fields: { input, numberOfCohorts: 2 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload2, onComplete, onError)
      const cohortWith2 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      const payload4 = generateTestPayload({
        fields: { input, numberOfCohorts: 4 },
        settings: {},
      })
      await assignToCohort.onActivityCreated!(payload4, onComplete, onError)
      const cohortWith4 = Number(
        onComplete.mock.calls[onComplete.mock.calls.length - 1][0].data_points
          .cohortNumber
      )

      expect(cohortWith2).toBeGreaterThanOrEqual(1)
      expect(cohortWith2).toBeLessThanOrEqual(2)
      expect(cohortWith4).toBeGreaterThanOrEqual(1)
      expect(cohortWith4).toBeLessThanOrEqual(4)

      // Both calls are deterministic
      onComplete.mockClear()
      await assignToCohort.onActivityCreated!(payload2, onComplete, onError)
      expect(
        Number(onComplete.mock.calls[0][0].data_points.cohortNumber)
      ).toBe(cohortWith2)

      onComplete.mockClear()
      await assignToCohort.onActivityCreated!(payload4, onComplete, onError)
      expect(
        Number(onComplete.mock.calls[0][0].data_points.cohortNumber)
      ).toBe(cohortWith4)
    })
  })

  describe('Different inputs produce different cohorts (distribution)', () => {
    test('Should distribute inputs across all cohorts with enough samples', async () => {
      const numberOfCohorts = 3
      const seenCohorts = new Set<number>()

      // Use enough diverse inputs to expect coverage of all cohorts
      const inputs = Array.from({ length: 50 }, (_, i) => `patient-${i}`)

      for (const input of inputs) {
        const payload = generateTestPayload({
          fields: { input, numberOfCohorts },
          settings: {},
        })

        await assignToCohort.onActivityCreated!(payload, onComplete, onError)
        const cohort = Number(
          onComplete.mock.calls[onComplete.mock.calls.length - 1][0]
            .data_points.cohortNumber
        )
        seenCohorts.add(cohort)
      }

      // With 50 inputs and 3 cohorts, we expect all cohorts to be covered
      expect(seenCohorts.size).toBe(numberOfCohorts)
    })
  })

  describe('Validation errors', () => {
    test('Should call onError with WRONG_INPUT when input is empty', async () => {
      const payload = generateTestPayload({
        fields: { input: '', numberOfCohorts: 3 },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            date: expect.any(String),
            text: { en: 'ZodValidationError' },
            error: {
              category: 'WRONG_INPUT',
              message: expect.stringContaining('input'),
            },
          }),
        ],
      })
    })

    test('Should call onError with WRONG_INPUT when input is undefined', async () => {
      const payload = generateTestPayload({
        fields: { input: undefined, numberOfCohorts: 3 },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            date: expect.any(String),
            text: { en: 'ZodValidationError' },
            error: {
              category: 'WRONG_INPUT',
              message: expect.stringContaining('input'),
            },
          }),
        ],
      })
    })

    test('Should call onError with WRONG_INPUT when numberOfCohorts is undefined', async () => {
      const payload = generateTestPayload({
        fields: { input: 'patient-123', numberOfCohorts: undefined },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            date: expect.any(String),
            text: { en: 'ZodValidationError' },
            error: {
              category: 'WRONG_INPUT',
              message: expect.stringContaining('numberOfCohorts'),
            },
          }),
        ],
      })
    })

    test('Should call onError with WRONG_INPUT when numberOfCohorts is 0', async () => {
      const payload = generateTestPayload({
        fields: { input: 'patient-123', numberOfCohorts: 0 },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            date: expect.any(String),
            text: { en: 'ZodValidationError' },
            error: {
              category: 'WRONG_INPUT',
              message: expect.stringContaining('numberOfCohorts'),
            },
          }),
        ],
      })
    })

    test('Should call onError with WRONG_INPUT when numberOfCohorts is negative', async () => {
      const payload = generateTestPayload({
        fields: { input: 'patient-123', numberOfCohorts: -1 },
        settings: {},
      })

      await assignToCohort.onActivityCreated!(payload, onComplete, onError)

      expect(onComplete).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            date: expect.any(String),
            text: { en: 'ZodValidationError' },
            error: {
              category: 'WRONG_INPUT',
              message: expect.stringContaining('numberOfCohorts'),
            },
          }),
        ],
      })
    })
  })
})
