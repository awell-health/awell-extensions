const mockSdk = {
  messages: {
    create: jest.fn((params) => {
      console.log('Mocking MessageBird SDK call to messages.create', params)
    }),
  },
}

const mockConstructor = jest.fn((params) => {
  console.log('Calling mock MessageBird constructor', params)

  return mockSdk
})

export default mockConstructor
