export const CmClientMockImplementation = {
  sendSms: jest.fn(),
}

const CmClientMock = jest.fn(() => CmClientMockImplementation)

export const CmClient = CmClientMock
