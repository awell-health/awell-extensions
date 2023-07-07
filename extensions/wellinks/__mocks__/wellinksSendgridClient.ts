export const WellinksSendgridClientMockImplementation = {
  groups: { addSuppression: jest.fn() }
}

const WellinksSendgridClientMock = jest.fn(() => WellinksSendgridClientMockImplementation)

export const WellinksSendgridClient = WellinksSendgridClientMock