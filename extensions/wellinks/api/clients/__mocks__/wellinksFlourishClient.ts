export const WellinksFlourishClientMockImplementation = {
  user: {
    exists: jest.fn(),
  },
  survey: {
    submit: jest.fn(),
  },
}

const WellinksFlourishClientMock = jest.fn(
  () => WellinksFlourishClientMockImplementation
)

export const WellinksFlourishClient = WellinksFlourishClientMock
