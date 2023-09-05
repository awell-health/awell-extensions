import {
  mockedCustomerData,
  mockedTicketData,
  mockedUserData,
} from './testData'

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
    updateMetadata: jest.fn((_, metadata) => ({
      data: {
        ...mockedUserData.metadata,
        ...metadata,
      },
    })),
    deleteMetadata: jest.fn(() => ({
      data: undefined,
    })),
  },
  deskApi: {
    createCustomer: jest.fn((arg) => ({
      data: { ...mockedCustomerData, ...arg },
    })),
    getCustomer: jest.fn((arg) => ({
      data: mockedCustomerData,
    })),
    updateCustomerCustomFields: jest.fn((arg) => ({
      data: mockedCustomerData,
    })),
    createTicket: jest.fn((arg) => ({
      data: mockedTicketData,
    })),
  },
}

const SendbirdClientMock = jest.fn(() => SendbirdClientMockImplementation)

export const SendbirdClient = SendbirdClientMock

export const isSendbirdChatError = jest.fn()
