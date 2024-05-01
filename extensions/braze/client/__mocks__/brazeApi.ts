export const mockBrazeApi = {
  sendEmail: jest.fn(() => {
    return { dispatch_id: 'email-sent-id' }
  }),
  sendSms: jest.fn(() => {
    return { dispatch_id: 'sms-sent-id' }
  }),
}

const mock = jest.fn().mockImplementation(() => {
  return mockBrazeApi
})

export default mock
