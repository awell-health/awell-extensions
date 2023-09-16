export const WellinksFlourishClientMockImplementation = {
  user: {
    exists: jest.fn(),
  },
}

const WellinksFlourishClientMock = jest.fn(
  () => WellinksFlourishClientMockImplementation
)

export const WellinksFlourishClient = WellinksFlourishClientMock
