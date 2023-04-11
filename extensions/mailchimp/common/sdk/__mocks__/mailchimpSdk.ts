const mockSdk = {
  messages: {
    send: jest.fn((params) => {
      console.log('Mocking Mailchimp SDK call to messages.send', params)
    }),
    sendTemplate: jest.fn((params) => {
      console.log('Mocking Mailchimp SDK call to messages.sendTemplate', params)
    }),
  },
}

const mockConstructor = jest.fn((params) => {
  console.log('Calling mock mailchimp constructor', params)
  return mockSdk
})

export default mockConstructor
