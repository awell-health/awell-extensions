import { mockedTaskData } from './testData'

export const ZendeskClientMockImplementation = {
  salesApi: {
    createTask: jest.fn((arg) => ({
      data: { data: { ...mockedTaskData, ...arg }, meta: { type: 'task' } },
    })),
    updateTask: jest.fn((arg) => ({
      data: { data: { ...mockedTaskData, ...arg }, meta: { type: 'task' } },
    })),
  },
}

const ZendeskClientMock = jest.fn(() => ZendeskClientMockImplementation)

export const ZendeskClient = ZendeskClientMock

export const isZendeskError = jest.fn()
