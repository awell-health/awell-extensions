import { type NewActivityPayload } from './NewActivityPayload'

export type OnActivityCreatedHandler<
  Settings = Record<string, string>,
  Fields = Record<string, string>
> = (
  {
    activity,
    settings,
    fields,
  }: {
    activity: NewActivityPayload['activity']
    settings: Settings
    fields: Fields
  },
  done: () => Promise<void>
) => Promise<void>
