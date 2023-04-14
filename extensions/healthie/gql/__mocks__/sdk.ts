export const mockGetSdkReturn = {
  getConversationList: jest.fn((args) => {
    return { data: { conversationMemberships: [] } }
  }),
  createConversation: jest.fn((args) => {
    return {
      data: {
        createConversation: {
          conversation: {
            id: 'conversation-1',
          },
        },
      },
    }
  }),
  sendChatMessage: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  createPatient: jest.fn((args) => {
    return {
      data: {
        createClient: {
          user: {
            id: 'patient-1',
          },
        },
      },
    }
  }),
  updatePatient: jest.fn((args) => {
    return {
      data: {
        updateClient: {
          user: {
            id: 'patient-1',
          },
        },
      },
    }
  }),
  applyTagsToUser: jest.fn((args) => {
    return {
      data: {
        bulkApply: {
          tags: [
            {
              id: 'tag-1',
              name: 'Tag',
            },
          ],
        },
      },
    }
  }),
  removeTagFromUser: jest.fn((args) => {
    return {
      data: {
        removeAppliedTag: {
          tag: {
            id: 'tag-1',
            name: 'Tag',
          },
        },
      },
    }
  }),
  getFormTemplate: jest.fn((args) => {
    return {
      data: {
        customModuleForm: {
          use_for_charting: true,
          custom_modules: [
            {
              id: 'question-1',
              mod_type: 'textarea',
            },
          ],
        },
      },
    }
  }),
  createFormAnswerGroup: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  createFormCompletionRequest: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  createLocation: jest.fn((args) => {
    return {
      data: {
        createLocation: {
          location: {
            id: 'location-1',
          },
        },
      },
    }
  }),
  updateConversation: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  deleteAppointment: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  updateAppointment: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  createJournalEntry: jest.fn((args) => {
    return {
      data: {
        createEntry: {
          entry: {
            id: 'entry-1',
          },
        },
      },
    }
  }),
  deleteTask: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  updateTask: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  createTask: jest.fn((args) => {
    return {
      data: {
        createTask: {
          task: {
            id: 'task-1',
          },
        },
      },
    }
  }),
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)
