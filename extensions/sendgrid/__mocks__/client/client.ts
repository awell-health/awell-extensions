export const SendgridClientMockImplementation = {
  mail: { send: jest.fn() },
  marketing: {
    contacts: {
      addOrUpdate: jest.fn(),
    },
  },
}

const SendgridClientMock = jest.fn(() => SendgridClientMockImplementation)

export const SendgridClient = SendgridClientMock
