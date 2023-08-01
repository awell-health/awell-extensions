export const SendBirdClientMockImplementation = {
  chatApi: { createUser: jest.fn() },
}

const SendBirdClientMock = jest.fn(() => SendBirdClientMockImplementation)

export const SendBirdClient = SendBirdClientMock
