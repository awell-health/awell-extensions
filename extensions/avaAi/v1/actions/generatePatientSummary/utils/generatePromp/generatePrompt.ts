import { isEmpty, isNil, omit, pick, startCase } from 'lodash'
import { type Patient } from '../../../../../../../lib/types/Patient'

export const promptQuestion =
  'Create a human-readable summary of a patient that only includes the below characteristics. The text should be written in the present tense and make sure the age is printed in parentheses after the birth date only when the birth date is known.'

export const generatePrompt = (
  patient: Patient,
  characteristics?: string[]
): string => {
  const flattenedProfile = {
    ...omit(patient.profile, ['address']),
    ...patient.profile?.address,
  }

  const getCharacteristicsForPrompt = (): Record<string, unknown> => {
    if (isNil(characteristics) || isEmpty(characteristics))
      return flattenedProfile

    return pick(flattenedProfile, characteristics)
  }

  const characteristicsForPrompt = getCharacteristicsForPrompt()
  const characteristicsArray = Object.entries(characteristicsForPrompt)
    .map((e) => ({ [e[0]]: e[1] }))
    .filter((chars) => {
      if (isNil(chars) || isEmpty(chars)) return false

      return true
    })

  const characteristicsPrompt = characteristicsArray
    .filter((char) => {
      const value = Object.values(char)[0]

      if (isNil(value) || isEmpty(value)) return false

      return true
    })
    .map((char) => {
      return `Characteristic: ${startCase(String(Object.keys(char)[0]))}
Value: ${String(Object.values(char)[0]).trim()}`
    })
    .join('\n\n')

  return `${promptQuestion}

${characteristicsPrompt}`
}
