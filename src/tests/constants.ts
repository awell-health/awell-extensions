import {
  Action,
  ExtensionAction,
  ExtensionWebhook,
  Webhook,
  type NewActivityPayload,
} from '@awell-health/extensions-core'
import { merge } from 'lodash'

export const testPayload: NewActivityPayload<any, any> = {
  pathway: {
    id: 'pathway-id',
    definition_id: 'pathway-definition-id',
  },
  activity: {
    id: 'activity-id',
    sessionId: 'session-id',
  },
  patient: {
    id: 'test-patient',
  },
  fields: {},
  settings: {},
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

type FieldsType = Record<string, string | number | boolean | undefined>
type SettingsType = Record<string, string | undefined>
type ReturnType<
  Fields extends FieldsType,
  Settings extends SettingsType
> = Omit<NewActivityPayload, 'fields' | 'settings'> & {
  fields: Fields
  settings: Settings
}

export const generateTestPayload = <
  Fields extends FieldsType,
  Settings extends SettingsType
>({
  fields,
  settings,
  ...value
}: DeepPartial<Omit<NewActivityPayload, 'fields' | 'settings'>> & {
  fields: Fields
  settings: Settings
}): ReturnType<Fields, Settings> => ({
  // merge will mutate the first object, which is a little dangerous
  ...merge({}, testPayload, value),
  fields,
  settings,
})

export const TestHelpers = {
  fromAction(action: Action<any, any>) {
    const helpers = {
      awellSdk: jest.fn().mockReturnValue({
        apiUrl: 'api-url',
        apiKey: 'api-key',
      }),
      httpsAgent: jest.fn(),
    }
    const onComplete = jest.fn()
    const onError = jest.fn()
    const clearMocks = () => {
      onComplete.mockClear()
      onError.mockClear()
      Object.values(helpers).forEach((mock) => mock.mockClear())
    }
    return {
      clearMocks,
      onComplete,
      onError,
      helpers,
      extensionAction: new ExtensionAction(action),
    }
  },
  fromWebhook(webhook: Webhook<any, any>) {
    const helpers = {
      awellSdk: jest.fn().mockReturnValue({
        apiUrl: 'api-url',
        apiKey: 'api-key',
      }),
      httpsAgent: jest.fn(),
    }
    const onComplete = jest.fn()
    const onError = jest.fn()
    const clearMocks = () => {
      onComplete.mockClear()
      onError.mockClear()
      Object.values(helpers).forEach((mock) => mock.mockClear())
    }
    return {
      clearMocks,
      onComplete,
      onError,
      helpers,
      extensionWebhook: new ExtensionWebhook(webhook),
    }
  },
}
