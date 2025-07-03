import { isNil } from 'lodash'

interface FormAnswer {
  id: string
  label?: string | null
  answer?: string | null
}

interface FormAnswerGroup {
  id: string
  user?: { id: string } | null
  form_answers: FormAnswer[]
  [key: string]: any
}

/**
 * Processes form answers to replace large ones with error messages when they exceed the size limit
 * @param formAnswerGroup The form answer group containing the answers to process
 * @param maxSizeKB The maximum size allowed for form answers in KB (undefined means no limit)
 * @returns A new form answer group with processed answers
 */
export function processFormAnswersForSize(
  formAnswerGroup: FormAnswerGroup,
  maxSizeKB?: number,
): FormAnswerGroup {
  // If no size limit is configured, return the original form answer group
  if (!maxSizeKB || !formAnswerGroup.form_answers) {
    return formAnswerGroup
  }

  const maxSizeBytes = maxSizeKB * 1024 // Convert KB to bytes

  const processedFormAnswers = formAnswerGroup.form_answers.map(
    (formAnswer) => {
      // Only process answers that have content
      if (!isNil(formAnswer.answer)) {
        const answerSizeBytes = Buffer.byteLength(formAnswer.answer, 'utf-8')

        // If answer exceeds the size limit, replace it with an error message
        if (answerSizeBytes > maxSizeBytes) {
          return {
            ...formAnswer,
            answer: `<div>Form answer max size exceeded. Size: ${answerSizeBytes} bytes, max size allowed: ${maxSizeBytes} bytes.</div>`,
          }
        }
      }

      // Return the original form answer if it's within the size limit or has no content
      return formAnswer
    },
  )

  // Return a new form answer group with the processed answers
  return {
    ...formAnswerGroup,
    form_answers: processedFormAnswers,
  }
}
