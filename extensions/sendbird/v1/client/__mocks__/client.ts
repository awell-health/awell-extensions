export const SendbirdClientMockImplementation = {
  chatApi: {
    createUser: jest.fn((arg) => ({
      data: arg,
    })),
  },
  deskApi: {},
}

const SendbirdClientMock = jest.fn(() => SendbirdClientMockImplementation)

export const SendbirdClient = SendbirdClientMock
