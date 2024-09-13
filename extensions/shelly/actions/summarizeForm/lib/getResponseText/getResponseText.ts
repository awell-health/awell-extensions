import {
  type Form,
  type FormResponse,
  type Question,
  type Answer,
} from '@awell-health/awell-sdk'

const getBooleanAnswer = (answer: string): string => {
  if (answer === '0') return 'No'

  if (answer === '1') return 'Yes'

  return ''
}

const getSingleSelectAnswer = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const answerValue = questionResponse.value
  const answerOptions = questionDefinition.options

  const answerLabel = answerOptions?.find(
    (answerOption) => String(answerOption.value) === String(answerValue)
  )?.label

  return String(answerLabel)
}

const getMultipleSelectAnswers = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const answerValues = JSON.parse(questionResponse.value) as Array<
    string | number
  >
  const answerOptions = questionDefinition.options

  const answerLabels = answerValues
    .map((answerValue) => {
      return answerOptions?.find(
        (answerOption) => String(answerOption.value) === String(answerValue)
      )?.label
    })
    .filter((answer): answer is string => answer !== undefined)

  return answerLabels.map((_answerLabel) => `- ${_answerLabel}`).join('\n')
}

const getQuestionAndAnswer = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const userQuestionType = questionDefinition.userQuestionType

  const addQuestionLabel = (answer: string): string => {
    return `${questionDefinition.title}\n${answer}`
  }

  switch (userQuestionType) {
    case 'YES_NO':
      return addQuestionLabel(getBooleanAnswer(questionResponse.value))
    case 'DATE':
      return addQuestionLabel(String(questionResponse.value))
    case 'NUMBER':
      return addQuestionLabel(String(questionResponse.value))
    case 'LONG_TEXT':
      return addQuestionLabel(String(questionResponse.value))
    case 'MULTIPLE_CHOICE':
      return addQuestionLabel(
        getSingleSelectAnswer(questionDefinition, questionResponse)
      )
    case 'MULTIPLE_SELECT':
      return addQuestionLabel(
        getMultipleSelectAnswers(questionDefinition, questionResponse)
      )
    case 'SLIDER':
      return addQuestionLabel(String(questionResponse.value))
    case 'SHORT_TEXT':
      return addQuestionLabel(String(questionResponse.value))
    case 'TELEPHONE':
      return addQuestionLabel(String(questionResponse.value))
    default:
      return addQuestionLabel(String(questionResponse.value))
  }
}

export interface OmittedFormAnswer {
  questionId: string
  reason: string
}

export const getResponseText = (opts: {
  formDefinition: Form
  formResponse: FormResponse
}): {
  result: string
  omittedFormAnswers: OmittedFormAnswer[]
} => {
  const formAnswers: string[] = []
  const omittedFormAnswers: OmittedFormAnswer[] = []

  opts.formResponse.answers.forEach((questionResponse) => {
    const questionDefinition = opts.formDefinition.questions.find(
      (q) => q.id === questionResponse.question_id
    )

    if (questionDefinition === undefined) {
      omittedFormAnswers.push({
        questionId: questionResponse.question_id,
        reason:
          'No corresponding question definition found in the form definition',
      })
      return
    }

    try {
      const answer = getQuestionAndAnswer(questionDefinition, questionResponse)

      formAnswers.push(answer)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      omittedFormAnswers.push({
        questionId: questionResponse.question_id,
        reason: `Error processing answer: ${errorMessage}`,
      })
    }
  })

  return {
    result: formAnswers.join('\n\n'),
    omittedFormAnswers,
  }
}
