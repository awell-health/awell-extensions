export interface OptionProps {
  label: string
  value: string
}

export const getTimezoneOptions = (): OptionProps[] => {
  const tz = new Intl.DateTimeFormat().resolvedOptions().timeZone
  return [tz].map((timezone: string) => ({
    label: timezone,
    value: timezone,
  }))
}
