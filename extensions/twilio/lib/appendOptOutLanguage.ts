import { isEmpty } from 'lodash'

type Language = 'en' | 'fr' | 'nl'

const DEFAULT_OPT_OUT_LANGUAGE: Record<Language, string> = {
  en: 'Reply STOP to unsubscribe.',
  fr: 'Répondez STOP pour vous désabonner.',
  nl: 'Antwoord STOP om geen communicate meer te ontvangen.',
}

export const appendOptOutLanguage = (
  message: string,
  optOutLanguage?: string,
  language?: Language
): string => {
  const lang = language ?? 'en'

  if (isEmpty(optOutLanguage) || optOutLanguage === undefined) {
    return `${message}\n\n${DEFAULT_OPT_OUT_LANGUAGE[lang]}`
  }

  return `${message}\n\n${optOutLanguage}`
}
