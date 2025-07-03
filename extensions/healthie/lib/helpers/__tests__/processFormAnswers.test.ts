import { processFormAnswersForSize } from '../processFormAnswers'

describe('processFormAnswersForSize', () => {
  const mockFormAnswerGroup = {
    id: '123',
    user: { id: 'user_456' },
    form_answers: [
      {
        id: '1',
        label: 'Small Answer',
        answer: 'This is a small answer',
      },
      {
        id: '2',
        label: 'Large Answer',
        answer: 'A'.repeat(25000), // 25KB
      },
      {
        id: '3',
        label: 'Null Answer',
        answer: null,
      },
      {
        id: '4',
        label: 'Undefined Answer',
        answer: undefined,
      },
    ],
  }

  describe('when maxSizeKB is not provided', () => {
    it('should return the original form answer group unchanged', () => {
      const result = processFormAnswersForSize(mockFormAnswerGroup)
      expect(result).toEqual(mockFormAnswerGroup)
    })

    it('should return the original form answer group when maxSizeKB is undefined', () => {
      const result = processFormAnswersForSize(mockFormAnswerGroup, undefined)
      expect(result).toEqual(mockFormAnswerGroup)
    })

    it('should return the original form answer group when maxSizeKB is 0', () => {
      const result = processFormAnswersForSize(mockFormAnswerGroup, 0)
      expect(result).toEqual(mockFormAnswerGroup)
    })
  })

  describe('when maxSizeKB is provided', () => {
    it('should replace large form answers with error messages', () => {
      const result = processFormAnswersForSize(mockFormAnswerGroup, 20) // 20KB limit

      expect(result.form_answers[0]).toEqual({
        id: '1',
        label: 'Small Answer',
        answer: 'This is a small answer', // Should remain unchanged
      })

      expect(result.form_answers[1]).toEqual({
        id: '2',
        label: 'Large Answer',
        answer:
          '<div>Form answer max size exceeded. Size: 25000 bytes, max size allowed: 20480 bytes.</div>',
      })

      expect(result.form_answers[2]).toEqual({
        id: '3',
        label: 'Null Answer',
        answer: null, // Should remain unchanged
      })

      expect(result.form_answers[3]).toEqual({
        id: '4',
        label: 'Undefined Answer',
        answer: undefined, // Should remain unchanged
      })
    })

    it('should handle multiple large answers correctly', () => {
      const formAnswerGroupWithMultipleLarge = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Large Answer 1',
            answer: 'B'.repeat(30000), // 30KB
          },
          {
            id: '2',
            label: 'Small Answer',
            answer: 'Small',
          },
          {
            id: '3',
            label: 'Large Answer 2',
            answer: 'C'.repeat(40000), // 40KB
          },
        ],
      }

      const result = processFormAnswersForSize(
        formAnswerGroupWithMultipleLarge,
        25,
      ) // 25KB limit

      expect(result.form_answers[0].answer).toBe(
        '<div>Form answer max size exceeded. Size: 30000 bytes, max size allowed: 25600 bytes.</div>',
      )
      expect(result.form_answers[1].answer).toBe('Small') // Should remain unchanged
      expect(result.form_answers[2].answer).toBe(
        '<div>Form answer max size exceeded. Size: 40000 bytes, max size allowed: 25600 bytes.</div>',
      )
    })

    it('should handle edge case where answer is exactly at the limit', () => {
      const exactLimitFormAnswerGroup = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Exact Limit Answer',
            answer: 'E'.repeat(20480), // Exactly 20KB (20 * 1024 bytes)
          },
        ],
      }

      const result = processFormAnswersForSize(exactLimitFormAnswerGroup, 20) // 20KB limit

      expect(result.form_answers[0].answer).toBe('E'.repeat(20480)) // Should remain unchanged
    })

    it('should handle edge case where answer is just over the limit', () => {
      const justOverLimitFormAnswerGroup = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Just Over Limit Answer',
            answer: 'F'.repeat(20481), // Just over 20KB (20 * 1024 + 1 bytes)
          },
        ],
      }

      const result = processFormAnswersForSize(justOverLimitFormAnswerGroup, 20) // 20KB limit

      expect(result.form_answers[0].answer).toBe(
        '<div>Form answer max size exceeded. Size: 20481 bytes, max size allowed: 20480 bytes.</div>',
      )
    })

    it('should preserve other properties of the form answer group', () => {
      const formAnswerGroupWithExtraProps = {
        ...mockFormAnswerGroup,
        custom_module_form: { id: 'form_123', name: 'Test Form' },
        finished: true,
      }

      const result = processFormAnswersForSize(
        formAnswerGroupWithExtraProps,
        20,
      )

      expect(result.id).toBe('123')
      expect(result.user).toEqual({ id: 'user_456' })
      expect(result.custom_module_form).toEqual({
        id: 'form_123',
        name: 'Test Form',
      })
      expect(result.finished).toBe(true)
    })

    it('should handle form answer group with no form_answers', () => {
      const noAnswersGroup = {
        id: '123',
        user: { id: 'user_456' },
        form_answers: [],
      }

      const result = processFormAnswersForSize(noAnswersGroup, 20)
      expect(result).toEqual(noAnswersGroup)
    })

    it('should handle form answer group with missing form_answers property', () => {
      const noFormAnswersProperty = {
        id: '123',
        user: { id: 'user_456' },
      } as any

      const result = processFormAnswersForSize(noFormAnswersProperty, 20)
      expect(result).toEqual(noFormAnswersProperty)
    })

    it('should calculate byte size correctly for Unicode characters', () => {
      const unicodeFormAnswerGroup = {
        ...mockFormAnswerGroup,
        form_answers: [
          {
            id: '1',
            label: 'Unicode Answer',
            answer: '🚀'.repeat(6827), // Each rocket emoji is ~4 bytes, so this is ~27KB
          },
        ],
      }

      const result = processFormAnswersForSize(unicodeFormAnswerGroup, 20) // 20KB limit

      expect(result.form_answers[0].answer).toContain(
        'Form answer max size exceeded. Size: 27308 bytes, max size allowed: 20480 bytes.',
      )
    })
  })
})
