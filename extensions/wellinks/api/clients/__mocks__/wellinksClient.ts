export const WellinksClientMockImplementation = {
  memberListEvent: {
    insert: jest.fn(),
  },
}

const WellinksClientMock = jest.fn(() => WellinksClientMockImplementation)

export const WellinksClient = WellinksClientMock
