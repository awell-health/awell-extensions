import { mockedUserData } from './testData'

export const SendbirdClientMockImplementation = {
  chatApi: {
    createUser: jest.fn((arg) => ({
      data: arg,
    })),
    getUser: jest.fn((arg) => ({
      data: mockedUserData,
    })),
    updateUser: jest.fn((arg) => ({
      data: arg,
    })),
    deleteUser: jest.fn(() => ({
      data: undefined,
    })),
  },
  deskApi: {},
}

const SendbirdClientMock = jest.fn(() => SendbirdClientMockImplementation)

export const SendbirdClient = SendbirdClientMock
