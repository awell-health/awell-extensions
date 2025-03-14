import * as tzdata from 'tzdata'
export interface OptionProps {
  label: string
  value: string
}

export const getTimezoneOptions = (): OptionProps[] => {
  return Object.keys(tzdata.zones).map((tz) => ({
    label: tz,
    value: tz,
  }))
}
