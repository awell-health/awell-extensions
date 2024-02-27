const samplePost = {
  body: 'Received', 
  creator: {phone_number: '+18999999999'},
  conversation_uuid: "30cded5d-90b7-4aae-9f51-b6b143376bb2"
}

export const mockReturnValue = {
  sendMessage: jest.fn((params) => {
    return  {post: samplePost}
  }),
  getMessages: jest.fn((phoneNumber: string) => {
    return phoneNumber === '+18999999999' ? 
      {posts: [samplePost]}
      : {}
  }),
  authenticate: jest.fn(() => {
    return {
      "user": {
          "avatar_url": null,
          "name": "Some User",
          "on_call": false,
          "username": "someusername",
          "uuid": "142e542b-5cdf-47c4-99a4-dc532ed6b519",
          "email": "someemail@awellhealth.com",
      },
      "access_token": {
          "token": "some_test_token"
      }
  }
  }),
 
}

const mock = jest.fn().mockImplementation((params) => {
  console.log('Calling mock textline constructor', params)

  return mockReturnValue
})

export default mock
