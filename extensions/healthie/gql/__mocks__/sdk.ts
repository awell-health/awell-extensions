const mockGetConversationList = jest.fn((args) => {
  console.log('getConversationList:', args);
  return { data: { conversationMemberships: [] } }
})

const mockCreateConversation = jest.fn((args) => {
  console.log('createConversation:', args);
  return {
    data: {
      createConversation: {
        conversation: {
          id: 'conversation-1'
        }
      }
    }
  }
})

const mockSendChatMessage = jest.fn((args) => {
  console.log('sendChatMessage:', args);
  return undefined
})

const mockGetSdk = jest.fn().mockImplementation((params) => {
  console.log('mockGetSdk:', params)

  return {
    getConversationList: mockGetConversationList,
    createConversation: mockCreateConversation,
    sendChatMessage: mockSendChatMessage
  };
});

export { mockGetSdk as getSdk, mockGetConversationList }
