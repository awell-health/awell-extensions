export const mockReturnValue = {
  sendEmail: jest.fn(() => {
    return { dispatch_id: '123' }
  }),
  sendSms: jest.fn(() => {
    return { dispatch_id: '321' }
  }),
}

const mock = jest.fn().mockImplementation(() => {
  return mockReturnValue
})

export default mock
