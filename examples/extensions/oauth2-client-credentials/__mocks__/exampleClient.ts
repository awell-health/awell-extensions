const MockSamplePartnerAPIClient = jest.fn().mockImplementation((params) => {
  return {
    hello: jest.fn((id?: string) => {
      return 'Response: ' + (id ?? 'world')
    }),
  }
})

const { makeExamplePartnerAPIClient } = jest.requireActual('../exampleClient')

const makeAPIClientMock = jest.fn((args) => {
  makeExamplePartnerAPIClient(args)

  return new MockSamplePartnerAPIClient(args)
})

export {
  MockSamplePartnerAPIClient as SamplePartnerAPIClient,
  makeAPIClientMock as makeExamplePartnerAPIClient,
}
