export const mockGetSdkReturn = {
  getConversationList: jest.fn((args) => {
    return { data: { conversationMemberships: [] } }
  }),
  createConversation: jest.fn((args) => {
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
    return undefined
  })
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn;
};

export const getSdk = jest.fn(mockGetSdk)
