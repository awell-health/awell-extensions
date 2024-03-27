const mockSdk = {
  messages: {
    create: jest.fn((params) => {
      console.log('Mocking twilio SDK call to messages.create', params)
      return {
        sid: '123',
      }
    }),
    list: jest.fn((params: { from: string }) => {
      return params.from === '+18999999999'
        ? [
            {
              body: 'Yes',
            },
          ]
        : []
    }),
  },
}

const mockConstructor = jest.fn((params) => {
  console.log('Calling mock twilio constructor', params)
  return mockSdk
})

export default mockConstructor
