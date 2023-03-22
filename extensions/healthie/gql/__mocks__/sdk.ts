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
  }),
  createPatient: jest.fn((args) => {
    console.log('createPatient:', args);
    return {
      data: {
        createClient: {
          user: {
            id: "patient-1",
          },
        },
      }
    }
  })
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn;
};

export const getSdk = jest.fn(mockGetSdk)
