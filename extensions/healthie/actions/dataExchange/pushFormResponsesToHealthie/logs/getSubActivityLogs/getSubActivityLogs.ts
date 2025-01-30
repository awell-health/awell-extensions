import { type ActivityEvent } from '@awell-health/extensions-core'

export enum HealthieOmitType {
  QUESTION_NOT_FOUND_IN_FORM_DEFINITION = 'QUESTION_NOT_FOUND_IN_FORM_DEFINITION',
  MISSING_MAPPING = 'MISSING_MAPPING',
  OTHER = 'OTHER',
}

interface OmittedFormAnswer {
  questionId: string
  reason: string
  omitType: HealthieOmitType
}

const getMappingLogs = (
  data: OmittedFormAnswer[],
): ActivityEvent | undefined => {
  const errors = data.filter(
    (item) => item.omitType === HealthieOmitType.MISSING_MAPPING,
  )

  if (errors.length === 0) return undefined

  const getMessage = (): string => {
    const errorText = errors
      .map((err) => {
        return `${err.questionId}`
      })
      .join(', ')

    return `Missing mapping for the below questions: ${errorText}`
  }

  const category = 'MISSING_SETTINGS'
  const message = getMessage()

  return {
    date: new Date().toISOString(),
    text: {
      en: message,
    },
    error: {
      category,
      message,
    },
  }
}

const getFormDefinitionLogs = (
  data: OmittedFormAnswer[],
): ActivityEvent | undefined => {
  const errors = data.filter(
    (item) =>
      item.omitType === HealthieOmitType.QUESTION_NOT_FOUND_IN_FORM_DEFINITION,
  )

  if (errors.length === 0) return undefined

  const getMessage = (): string => {
    const errorText = errors
      .map((err) => {
        return `${err.questionId}`
      })
      .join(', ')

    return `The following questions in the response could not be linked to a question definition in the form definition: ${errorText}`
  }

  const category = 'SERVER_ERROR'
  const message = getMessage()

  return {
    date: new Date().toISOString(),
    text: {
      en: message,
    },
    error: {
      category,
      message,
    },
  }
}

const getOtherErrors = (
  data: OmittedFormAnswer[],
): ActivityEvent | undefined => {
  const errors = data.filter((item) => item.omitType === HealthieOmitType.OTHER)

  if (errors.length === 0) return undefined

  const getMessage = (): string => {
    const errorText = errors
      .map((err) => {
        return `${err.questionId}: ${err.reason}`
      })
      .join(', ')

    return `There was an unexpected error transforming the following Awell form answers to Healthie form answers: ${errorText}`
  }

  const category = 'SERVER_ERROR'
  const message = getMessage()

  return {
    date: new Date().toISOString(),
    text: {
      en: message,
    },
    error: {
      category,
      message,
    },
  }
}

export const getSubActivityLogs = (
  data: OmittedFormAnswer[],
): ActivityEvent[] => {
  const activityEvents = [
    getMappingLogs(data),
    getFormDefinitionLogs(data),
    getOtherErrors(data),
  ].filter((_) => _ !== undefined)

  return activityEvents as ActivityEvent[]
}
