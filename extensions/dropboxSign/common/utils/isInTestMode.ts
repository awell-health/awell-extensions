import { lowerCase } from 'lodash'

/**
 * Function to determine whether `testMode` for DropboxSign extension is enabled.
 * This is a workaround to account for the fact we don't have a boolean setting field.
 * @param {string} testMode the value of `testMode` setting
 * @returns true if testMode is "yes"
 */

export const isInTestMode = (testMode: string): boolean => {
  const serializedValue = lowerCase(testMode)

  if (serializedValue === 'yes') {
    return true
  }

  return false
}
