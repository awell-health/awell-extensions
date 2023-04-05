import { isNil } from 'lodash'
import { type languages } from 'messagebird/types/voice_messages'

/**
 * Unfortunately, type "languages" from the MessageBird SDK is a union type
 * which makes it impossible to convert it to a tuple or generate an array from it at run-time.
 * That's why we are duplicating the list of languages here.
 */
const ALL_LANGUAGES = [
  'cy-gb',
  'da-dk',
  'de-de',
  'el-gr',
  'en-au',
  'en-gb',
  'en-gb-wls',
  'en-in',
  'en-us',
  'es-es',
  'es-mx',
  'es-us',
  'fr-ca',
  'fr-fr',
  'id-id',
  'is-is',
  'it-it',
  'ja-jp',
  'ko-kr',
  'ms-my',
  'nb-no',
  'nl-nl',
  'pl-pl',
  'pt-br',
  'pt-pt',
  'ro-ro',
  'ru-ru',
  'sv-se',
  'ta-in',
  'th-th',
  'tr-tr',
  'vi-vn',
  'zh-cn',
  'zh-hk',
]

export const getVoiceLanguage = (
  voiceLanguageFieldValue: string | undefined
): languages => {
  const defaultVoiceLanguage = 'en-gb'

  if (isNil(voiceLanguageFieldValue)) return defaultVoiceLanguage

  if (ALL_LANGUAGES.includes(voiceLanguageFieldValue)) {
    return voiceLanguageFieldValue as languages
  }

  return defaultVoiceLanguage
}
