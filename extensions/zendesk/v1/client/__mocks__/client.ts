import { mockedTaskData } from './testData'

export const ZendeskClientMockImplementation = {
  salesApi: {
    createTask: jest.fn((arg) => ({
      data: { task: { ...mockedTaskData, ...arg } },
    })),
    updateTask: jest.fn((arg) => ({
      data: { task: { ...mockedTaskData, ...arg } },
    })),
  },
}

const ZendeskClientMock = jest.fn(() => ZendeskClientMockImplementation)

export const ZendeskClient = ZendeskClientMock

export const isZendeskError = jest.fn()
