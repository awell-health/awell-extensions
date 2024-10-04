import {
  type Form,
  type FormResponse,
  type Question,
  type Answer,
} from '@awell-health/awell-sdk'

const getBooleanAnswer = (answer: string): string => {
  if (answer === '0') return 'Answer: No'

  if (answer === '1') return 'Answer: Yes'

  return 'Answer: unknown'
}

const getSingleSelectAnswer = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const answerValue = questionResponse.value
  const answerOptions = questionDefinition.options ?? []

  const allAnswerOptions = answerOptions
    ?.map((option) => {
      return `- ${option.label} (${option.value_string})`
    })
    .join('\n')

  const answerLabel = answerOptions?.find(
    (answerOption) => answerOption.value_string === answerValue
  )?.label

  return `Possible answers:\n${allAnswerOptions}\nAnswer: ${String(
    answerLabel
  )}`
}

const getMultipleSelectAnswers = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const answerValues = JSON.parse(questionResponse.value) as Array<
    string | number
  >
  const answerOptions = questionDefinition.options ?? []

  const answerLabels = answerValues
    .map((answerValue) => {
      return answerOptions?.find(
        (answerOption) => answerOption.value_string === String(answerValue)
      )?.label
    })
    .filter((answer): answer is string => answer !== undefined)

  const allAnswerOptions = answerOptions
    ?.map((option) => {
      return `- ${option.label} (${option.value_string})`
    })
    .join('\n')

  return `Possible answers:\n${allAnswerOptions}\nAnswers:\n${answerLabels
    .map((_answerLabel) => `- ${_answerLabel}`)
    .join('\n')}`
}

const getQuestionAndAnswer = (
  questionDefinition: Question,
  questionResponse: Answer
): string => {
  const userQuestionType = questionDefinition.userQuestionType

  const addQuestionLabel = (answer: string): string => {
    return `Question: ${questionDefinition.title}\nQuestion type: ${
      questionDefinition.userQuestionType ?? 'UNKNOWN'
    }\n${answer}`
  }

  switch (userQuestionType) {
    case 'YES_NO':
      return addQuestionLabel(getBooleanAnswer(questionResponse.value))
    case 'DATE':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    case 'NUMBER':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    case 'LONG_TEXT':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    case 'MULTIPLE_CHOICE':
      return addQuestionLabel(
        getSingleSelectAnswer(questionDefinition, questionResponse)
      )
    case 'MULTIPLE_SELECT':
      return addQuestionLabel(
        getMultipleSelectAnswers(questionDefinition, questionResponse)
      )
    case 'SLIDER':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    case 'SHORT_TEXT':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    case 'TELEPHONE':
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
    default:
      return addQuestionLabel(`Answer: ${String(questionResponse.value)}`)
  }
}

export interface OmittedFormAnswer {
  questionId: string
  reason: string
}

export const getFormTitle = (opts: {
  formDefinition: Form
}): string => {
  return opts.formDefinition.title
}

export const getFormResponseText = (opts: {
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

  const formTitle = getFormTitle({ formDefinition: opts.formDefinition });
  return {
    result: `Form Title: ${formTitle}\n\n${formAnswers.join('\n\n----------------\n\n')}`,
    omittedFormAnswers,
  }
}


export const getResponsesForAllForms = (opts: {
  formsData: Array<{
    formActivityId: string
    formId: string
    formDefinition: Form
    formResponse: FormResponse
  }>
}): {
  result: string
  omittedFormAnswers: OmittedFormAnswer[]
} => {

  const allFormResponses = opts.formsData.map((formData) => {
    const formResponseText = getFormResponseText({
      formDefinition: formData.formDefinition,
      formResponse: formData.formResponse,
    });
    return {
      formActivityId: formData.formActivityId,
      formId: formData.formId,
      ...formResponseText
    };
  });

  const concatenatedResponses = allFormResponses
    .map((response) => `Form Activity ID: ${response.formActivityId}\nForm ID: ${response.formId}\n${response.result}`)
    .join('\n\n==========Next Form==========\n\n');

  const allOmittedAnswers = allFormResponses.flatMap(
    (response) => response.omittedFormAnswers
  );

  return {
    result: concatenatedResponses,
    omittedFormAnswers: allOmittedAnswers,
  };
};
