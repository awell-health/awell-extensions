import { type settings } from '../../settings'
import {
  type NewActivityPayload,
  type Fields,
} from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

// type Payload = Parameters<Action<any, typeof settings>['onActivityCreated']>[0]

export const SendgridClientMockImplementation = {
  mail: { send: jest.fn() },
  marketing: {
    contacts: {
      addOrUpdate: jest.fn(),
      importStatus: jest.fn(),
    },
  },
  groups: {
    suppressions: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  },
}

const SendgridClientMock = jest.fn(() => SendgridClientMockImplementation)

export const mockActionPayload = <T extends Fields>(args: {
  fields?: any
  settings?: any
  patient?: any
  pathway?: any
  activity?: any
}): NewActivityPayload<T, typeof settings> => {
  return generateTestPayload({
    fields: args.fields ?? {},
    settings: args.settings ?? {
      apiKey: 'apiKey',
      fromName: 'fromName',
      fromEmail: 'from@test.com',
    },
  })
}

export const SendgridClient = SendgridClientMock
