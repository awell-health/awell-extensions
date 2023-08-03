import { mockedUserData } from './testData'

export const SendbirdClientMockImplementation = {
  chatApi: {
    createUser: jest.fn((arg) => ({
      data: arg,
    })),
    getUser: jest.fn((arg) => ({
      data: mockedUserData,
    })),
  },
  deskApi: {},
}

const SendbirdClientMock = jest.fn(() => SendbirdClientMockImplementation)

export const SendbirdClient = SendbirdClientMock
