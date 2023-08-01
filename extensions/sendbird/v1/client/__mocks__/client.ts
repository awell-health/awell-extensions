export const SendBirdClientMockImplementation = {
  chatApi: {
    createUser: jest.fn((arg) => ({
      data: arg,
    })),
  },
}

const SendBirdClientMock = jest.fn(() => SendBirdClientMockImplementation)

export const SendBirdClient = SendBirdClientMock
