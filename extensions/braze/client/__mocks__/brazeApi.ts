export const mockReturnValue = {
  sendMessage: jest.fn(() => {
    return { dispatch_id: '123' }
  }),
}

const mock = jest.fn().mockImplementation(() => {
  return mockReturnValue
})

export default mock
