const samplePost = {
  created_at: 1708622172,
  body: 'Received',
  creator: { phone_number: '+18999999999' },
  conversation_uuid: '30cded5d-90b7-4aae-9f51-b6b143376bb2',
  uuid: '7d3d9cbc-c053-4e7c-b837-cb2e38202117',
}

const samplePost2 = {
  created_at: 1709078372,
  body: 'Yes',
  creator: { phone_number: '+18999999999' },
  conversation_uuid: '30cded5d-90b7-4aae-9f51-b6b143376bb2',
  uuid: '7d3d9cbc-c053-4e7c-b837-cb2e38202117',
}

export const mockReturnValue = {
  sendMessage: jest.fn((params) => {
    return { post: samplePost }
  }),
  getMessages: jest.fn((phoneNumber: string) => {
    return phoneNumber === '+18999999999' ? { posts: [samplePost, samplePost2] } : {}
  }),
  setContactConsent: jest.fn((params) => {
  }),
}

const mock = jest.fn().mockImplementation((params) => {
  console.log('Calling mock textline constructor', params)

  return mockReturnValue
})

export default mock
