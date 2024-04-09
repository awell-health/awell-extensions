const { makeAPIClient: makeAPIClientActual } = jest.requireActual(
  '../client/talkDeskClient'
)

export const mockClientReturn = {}
const TalkDeskAPIClientMock = jest.fn((params) => {
  return mockClientReturn
})

export const makeAPIClientMockFunc = (args: any): any => {
  makeAPIClientActual(args)

  return new TalkDeskAPIClientMock(args)
}
const makeAPIClientMock = jest.fn(makeAPIClientMockFunc)

export {
  TalkDeskAPIClientMock as TalkDeskAPIClient,
  makeAPIClientMock as makeAPIClient,
}
