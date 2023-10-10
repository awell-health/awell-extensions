export const IterableClientMockImplementation = {
  emailApi: {
    sendEmail: jest.fn((arg) => ({
      data: arg,
    })),
  },
}

const IterableClientMock = jest.fn(() => IterableClientMockImplementation)

export const IterableClient = IterableClientMock
