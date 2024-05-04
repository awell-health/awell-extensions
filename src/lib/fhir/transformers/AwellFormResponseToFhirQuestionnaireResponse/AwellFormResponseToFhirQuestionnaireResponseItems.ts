import {
  type Answer,
  type Form,
  type FormResponse,
  UserQuestionType,
} from '../../../../../extensions/awell/v1/gql/graphql'
import {
  type QuestionnaireResponseItem,
  type QuestionnaireResponseItemAnswer,
} from '@medplum/fhirtypes'
import { isNil } from 'lodash'

const getQuestionLabel = (
  awellFormDefinition: Form,
  questionId: string
): string => {
  const itemDefinition = awellFormDefinition.questions.find(
    (item) => item.id === questionId
  )

  if (isNil(itemDefinition)) {
    throw new Error(
      `Could not find question definition for question with id ${questionId}`
    )
  }

  return itemDefinition.title
}

const getMultipleSelectFhirAnswers = (
  itemResponse: Answer
): QuestionnaireResponseItemAnswer[] => {
  const itemResponseValueArray = JSON.parse(itemResponse.value) as Array<
    number | string
  >
  const itemResponseLabelArray = itemResponse.label?.split(', ') ?? []

  return itemResponseValueArray.map((item, i) => {
    return {
      valueCoding: {
        code: String(item),
        display: String(itemResponseLabelArray[i]),
      },
    }
  })
}

const getAnswer = (
  awellFormDefinition: Form,
  itemResponse: Answer
): QuestionnaireResponseItemAnswer[] => {
  const itemDefinition = awellFormDefinition.questions.find(
    (item) => item.id === itemResponse.question_id
  )

  if (isNil(itemDefinition)) {
    throw new Error(
      `Could not find question definition for question with id ${itemResponse.question_id}`
    )
  }

  const userQuestionType = itemDefinition.userQuestionType

  switch (userQuestionType) {
    case UserQuestionType.YesNo:
      return [
        {
          valueBoolean: Boolean(itemResponse.value),
        },
      ]
    case UserQuestionType.Date:
      return [
        {
          valueDateTime: itemResponse.value,
        },
      ]
    case UserQuestionType.Number:
      return [
        {
          valueInteger: Number(itemResponse.value),
        },
      ]
    case UserQuestionType.LongText:
      return [
        {
          valueString: itemResponse.value,
        },
      ]
    case UserQuestionType.MultipleChoice:
      return [
        {
          valueCoding: {
            code: itemResponse.value,
            display: itemResponse.label ?? 'Answer label not found',
          },
        },
      ]
    case UserQuestionType.MultipleSelect:
      return getMultipleSelectFhirAnswers(itemResponse)
    case UserQuestionType.Slider:
      return [
        {
          valueInteger: Number(itemResponse.value),
        },
      ]
    case UserQuestionType.ShortText:
      return [
        {
          valueString: itemResponse.value,
        },
      ]
    case UserQuestionType.Telephone:
      return [
        {
          valueString: itemResponse.value,
        },
      ]
    default:
      return [
        {
          valueString: String(itemResponse.value),
        },
      ]
  }
}

export const AwellFormResponseToFhirQuestionnaireResponseItems = (opts: {
  awellFormDefinition: Form
  awellFormResponse: FormResponse
}): QuestionnaireResponseItem[] => {
  return opts.awellFormResponse.answers.map((itemResponse) => {
    return {
      linkId: itemResponse.question_id,
      text: getQuestionLabel(
        opts.awellFormDefinition,
        itemResponse.question_id
      ),
      answer: getAnswer(opts.awellFormDefinition, itemResponse),
    } satisfies QuestionnaireResponseItem
  })
}
