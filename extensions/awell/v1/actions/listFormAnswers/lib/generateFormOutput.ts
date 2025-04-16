import {
  type Form,
  type FormResponse,
  type Question,
  type Answer,
  type AwellSdk,
} from '@awell-health/awell-sdk'
import { type OutputLanguageType } from '../config/fields'
import { isEmpty, isNil } from 'lodash'

const BOOLEAN_TRANSLATIONS: Record<
  string,
  Record<OutputLanguageType, string>
> = {
  '0': {
    Dutch: 'Nee',
    French: 'Non',
    English: 'No',
  },
  '1': {
    Dutch: 'Ja',
    French: 'Oui',
    English: 'Yes',
  },
}

const MISSING_ANSWER_TRANSLATIONS: Record<OutputLanguageType, string> = {
  Dutch: 'Geen antwoord of niet van toepassing',
  French: 'Aucune réponse ou non applicable',
  English: 'No answer or not applicable',
}

const getBooleanAnswer = (
  answer: string,
  language: OutputLanguageType,
): string => {
  return BOOLEAN_TRANSLATIONS[answer]?.[language] ?? 'Unknown'
}

const getMissingAnswer = (
  questionDefinition: Question,
  language: OutputLanguageType,
): string => {
  const missingAnswerTranslation = MISSING_ANSWER_TRANSLATIONS[language]
  return `${questionDefinition.title}:\n${missingAnswerTranslation}`
}

const getSingleSelectAnswer = (
  questionDefinition: Question,
  questionResponse: Answer,
): string => {
  const answerValue = questionResponse.value
  const answerOptions = questionDefinition.options ?? []

  const answerLabel = answerOptions?.find(
    (answerOption) => answerOption.value_string === answerValue,
  )?.label

  return String(answerLabel)
}

const getMultipleSelectAnswers = (
  questionDefinition: Question,
  questionResponse: Answer,
): string => {
  const answerValues = JSON.parse(questionResponse.value) as Array<
    string | number
  >
  const answerOptions = questionDefinition.options ?? []

  const answerLabels = answerValues
    .map((answerValue) => {
      return answerOptions?.find(
        (answerOption) => answerOption.value_string === String(answerValue),
      )?.label
    })
    .filter((answer): answer is string => answer !== undefined)

  return answerLabels.map((_answerLabel) => `- ${_answerLabel}`).join('\n')
}

const languageToLocaleString = (language: OutputLanguageType): string => {
  switch (language) {
    case 'Dutch':
      return 'nl-NL'
    case 'French':
      return 'fr-FR'
    case 'English':
      return 'en-US'
    default:
      return 'en-US'
  }
}

const getDateAnswer = (
  answer: string,
  language: OutputLanguageType,
): string => {
  const date = new Date(answer)
  const locale = languageToLocaleString(language)
  return date.toLocaleString(locale)
}

const getQuestionAndAnswer = (
  questionDefinition: Question,
  questionResponse: Answer,
  language: OutputLanguageType,
): string => {
  const userQuestionType = questionDefinition.userQuestionType

  const addQuestionLabel = (answer: string): string => {
    return `${questionDefinition.title}:\n${answer}`
  }

  switch (userQuestionType) {
    case 'YES_NO':
      return addQuestionLabel(
        getBooleanAnswer(questionResponse.value, language),
      )
    case 'DATE':
      return addQuestionLabel(getDateAnswer(questionResponse.value, language))
    case 'NUMBER':
      return addQuestionLabel(String(questionResponse.value))
    case 'LONG_TEXT':
      return addQuestionLabel(String(questionResponse.value))
    case 'MULTIPLE_CHOICE':
      return addQuestionLabel(
        getSingleSelectAnswer(questionDefinition, questionResponse),
      )
    case 'MULTIPLE_SELECT':
      return addQuestionLabel(
        getMultipleSelectAnswers(questionDefinition, questionResponse),
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
  questionKey: string
  reason: string
}

export const generateFormOutput = (opts: {
  awellSdk: AwellSdk
  formDefinition: Form
  formResponse: FormResponse
  language: OutputLanguageType
  includeDescriptions: boolean
  includeMissingAnswers: boolean
  separator?: string
}): {
  result: string
  omittedFormAnswers: OmittedFormAnswer[]
} => {
  const formAnswers: string[] = []
  const omittedFormAnswers: OmittedFormAnswer[] = []

  opts.formDefinition.questions.forEach((questionDefinition) => {
    const questionResponse = opts.formResponse.answers.find(
      (a) => a.question_id === questionDefinition.id,
    )

    if (questionResponse === undefined) {
      if (
        questionDefinition.userQuestionType === 'DESCRIPTION' &&
        opts.includeDescriptions
      ) {
        const escapedDescription =
          opts.awellSdk.utils.awell.slateToEscapedJsString(
            questionDefinition.title,
          )
        formAnswers.push(escapedDescription)
        return
      }

      if (opts.includeMissingAnswers) {
        formAnswers.push(getMissingAnswer(questionDefinition, opts.language))
        return
      }

      omittedFormAnswers.push({
        questionId: questionDefinition.id,
        questionKey: questionDefinition.key,
        reason:
          questionDefinition.userQuestionType === 'DESCRIPTION'
            ? 'Question is a description and is not included in the output'
            : 'Answer is missing in the form response and is not included in the output',
      })
      return
    }

    try {
      const answer = getQuestionAndAnswer(
        questionDefinition,
        questionResponse,
        opts.language,
      )
      formAnswers.push(answer)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      omittedFormAnswers.push({
        questionId: questionDefinition.id,
        questionKey: questionDefinition.key,
        reason: `Error processing answer: ${errorMessage}`,
      })
    }
  })

  const separator =
    !isNil(opts.separator) && !isEmpty(opts.separator)
      ? `\n\n${opts.separator}\n\n`
      : '\n\n'

  return {
    result: formAnswers.join(separator),
    omittedFormAnswers,
  }
}
