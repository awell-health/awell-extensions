const samplePost = {
  body: 'Received',
  creator: { phone_number: '+18999999999' },
  conversation_uuid: '30cded5d-90b7-4aae-9f51-b6b143376bb2',
}

export const mockReturnValue = {
  sendMessage: jest.fn((params) => {
    return { post: samplePost }
  }),
  getMessages: jest.fn((phoneNumber: string) => {
    return phoneNumber === '+18999999999' ? { posts: [samplePost] } : {}
  }),
}

const mock = jest.fn().mockImplementation((params) => {
  console.log('Calling mock textline constructor', params)

  return mockReturnValue
})

export default mock
