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
    return {
      data: {
        createClient: {
          user: {
            id: "patient-1",
          },
        },
      }
    }
  }),
  updatePatient: jest.fn((args) => {
    return {
      data: {
        updateClient: {
          user: {
            id: "patient-1",
          },
        },
      }
    }
  }),
  applyTagsToUser: jest.fn((args) => {
    return {
      data: {
        bulkApply: {
          tags: [{
            id: "tag-1",
            name: "Tag",
          }],
        },
      }
    }
  }),
  removeTagFromUser: jest.fn((args) => {
    return {
      data: {
        removeAppliedTag: {
          tag: {
            id: "tag-1",
            name: "Tag",
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
