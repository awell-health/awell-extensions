import { type ExtensionActivityRecord, type ExtensionActionField } from '../types'

export type ExtensionActivityRecordSettings =
  ExtensionActivityRecord['settings']
export const mapActionFieldsToObject = <T extends Record<string, unknown>>(
  fields: ExtensionActionField[]
): T =>
  fields.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      [currentValue.id]: currentValue.value,
    }
  }, {}) as T

export const mapSettingsToObject = <T extends Record<string, unknown>>(
  settings: ExtensionActivityRecordSettings
): T =>
  settings?.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      [currentValue.key]: currentValue.value,
    }
  }, {}) as T
