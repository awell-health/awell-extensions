export const mockGetSdkReturn = {
  getConversationList: jest.fn((args) => {
    console.log('getConversationList:', args);
    return { data: { conversationMemberships: [] } }
  }),
  createConversation: jest.fn((args) => {
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
  }),
  sendChatMessage: jest.fn((args) => {
    console.log('sendChatMessage:', args);
    return undefined
  })
}

export const mockGetSdk = (params: any): any => {
  console.log('mockGetSdk:', params)

  return mockGetSdkReturn;
};

export const getSdk = jest.fn(mockGetSdk)
