export const ZendeskClientMockImplementation = {
  salesApi: {
    createTask: jest.fn().mockResolvedValue({
      data: {
        data: { id: 1 },
      },
    }),
    updateTask: jest.fn().mockResolvedValue({}),
  },
}

export class ZendeskClient {
  salesApi = ZendeskClientMockImplementation.salesApi
}
