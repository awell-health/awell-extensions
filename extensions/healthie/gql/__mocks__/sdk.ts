import {
  type GetAppointmentQuery,
  type GetAppointmentQueryVariables,
} from '../sdk'

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
  getUser: jest.fn((args) => {
    return {
      data: {
        user: {
          id: 'patient-1',
          first_name: 'first',
          last_name: 'last',
          dob: '1990-01-01',
          email: 'test@test.com',
          gender: 'F',
          phone_number: '+1 (555) 555-1234',
          user_group: { name: 'group' },
          dietitian_id: 'dietitian_id',
          quick_notes: '<p>quick notest</p>',
        },
      },
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
  getAppointment: jest.fn<
    { data: GetAppointmentQuery },
    [GetAppointmentQueryVariables]
  >((args) => {
    return {
      data: {
        appointment: {
          id: 'appointment-1',
        },
      },
    }
  }),
  entries: jest.fn((args) => {
    return {
      data: {
        entries: [
          {
            id: '714884',
            metric_stat: 190.0,
            created_at: '2023-10-06 12:08:34 +0200',
          },
          {
            id: '714883',
            metric_stat: 182.0,
            created_at: '2023-10-06 12:08:32 +0200',
          },
        ],
      },
    }
  }),
  createEntry: jest.fn((args) => {
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
  appointments: jest.fn((args) => {
    return {
      data: {
        appointmentsCount: 1,
        appointments: [
          {
            id: '265851',
            date: '2023-10-18 11:00:00 +0200',
            contact_type: 'Healthie Video Call',
            length: 60,
            location: 'Healthie Video Call',
            provider: {
              id: '303275',
              full_name: 'Michał Grzelak',
            },
            appointment_type: {
              name: 'Initial Consultation',
              id: '54454',
            },
            attendees: [
              {
                id: '357883',
                full_name: 'Test Awell',
                first_name: 'Test',
                avatar_url: 'original/missing.png',
                phone_number: null,
              },
            ],
          },
        ],
      },
    }
  }),
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)
