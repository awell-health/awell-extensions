import { type NewActivityPayload } from './NewActivityPayload'

export type OnActivityCreatedHandler<
  Settings = Record<string, string>,
  Fields = Record<string, string>
> = (
  {
    activity,
    settings,
    fields,
    token,
  }: {
    activity: NewActivityPayload['activity']
    settings: Settings
    fields: Fields
    token?: string
  },
  done: () => Promise<void>
) => Promise<void>
