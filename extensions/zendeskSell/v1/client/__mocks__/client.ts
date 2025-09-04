import { mockedTaskData } from './testData'

export const ZendeskClientMockImplementation = {
  salesApi: {
    createTask: jest.fn().mockResolvedValue({
      data: {
        data: { id: mockedTaskData.id },
      },
    }),
    updateTask: jest.fn().mockResolvedValue({}),
  },
}

export class ZendeskClient {
  salesApi = ZendeskClientMockImplementation.salesApi
}
