import {
  type Form,
  type Question,
  UserQuestionType,
  type Option,
} from '../../../../../extensions/awell/v1/gql/graphql'
import {
  type Questionnaire,
  type QuestionnaireItem,
  type QuestionnaireItemAnswerOption,
} from '@medplum/fhirtypes'
import { kebabCase, pickBy } from 'lodash'

const getQuestionnaireItemType = (
  question: Question
): Pick<QuestionnaireItem, 'type'> => {
  const userQuestionType = question.userQuestionType

  switch (userQuestionType) {
    case UserQuestionType.Description:
      return {
        type: 'display',
      }
    case UserQuestionType.YesNo:
      return {
        type: 'boolean',
      }
    case UserQuestionType.Date:
      return {
        type: 'dateTime',
      }
    case UserQuestionType.Number:
      return {
        type: 'integer',
      }
    case UserQuestionType.LongText:
      return {
        type: 'text',
      }
    case UserQuestionType.MultipleChoice:
      return {
        type: 'choice',
      }
    case UserQuestionType.MultipleSelect:
      return {
        type: 'choice',
      }
    case UserQuestionType.Slider:
      return {
        type: 'integer',
      }
    case UserQuestionType.ShortText:
      return {
        type: 'string',
      }
    case UserQuestionType.Telephone:
      return {
        type: 'string',
      }
    default:
      return {
        type: 'string',
      }
  }
}

const getSelectAnswerOptions = (
  answerOptions: Option[]
): QuestionnaireItemAnswerOption[] => {
  return answerOptions.map((option) => {
    return {
      valueCoding: {
        code: String(option.value_string),
        display: String(option.label),
      },
    }
  })
}

const getFormItems = (formQuestions: Question[]): QuestionnaireItem[] => {
  return formQuestions.map((q) => {
    const obj = {
      linkId: q.id,
      text:
        q.userQuestionType === UserQuestionType.Description
          ? JSON.stringify(q.title) // Description titles are slate and gives errors when using JSON.parse
          : q.title,
      type: getQuestionnaireItemType(q).type,
      repeats:
        q.userQuestionType === UserQuestionType.MultipleSelect
          ? true
          : undefined,
      required:
        q.userQuestionType === UserQuestionType.Description
          ? undefined
          : q.questionConfig?.mandatory,
      answerOption:
        q.userQuestionType === UserQuestionType.MultipleSelect ||
        q.userQuestionType === UserQuestionType.MultipleChoice
          ? getSelectAnswerOptions(q.options ?? [])
          : undefined,
    }

    // @ts-expect-error fix later
    return pickBy(obj, (v) => v !== undefined) as QuestionnaireItem
  })
}

export const AwellFormToFhirQuestionnaire = (
  awellFormDefinition: Form
): Questionnaire => {
  return {
    resourceType: 'Questionnaire',
    url: `http://awellhealth.com/forms/${awellFormDefinition.definition_id}`,
    name: `${kebabCase(awellFormDefinition.title)}-version-${
      awellFormDefinition.id
    }`,
    title: `${awellFormDefinition.title} (version ${awellFormDefinition.id})`,
    copyright: awellFormDefinition?.trademark ?? undefined,
    status: 'unknown',
    version: awellFormDefinition.id,
    publisher: 'Awell',
    contact: [
      {
        name: 'Awell',
        telecom: [
          {
            system: 'email',
            value: 'info@awellhealth.com',
          },
        ],
      },
    ],
    identifier: [
      {
        system: 'https://awellhealth.com/forms',
        value: `${awellFormDefinition.definition_id}/published/${awellFormDefinition.id}`,
      },
    ],
    item: getFormItems(awellFormDefinition.questions),
  }
}
