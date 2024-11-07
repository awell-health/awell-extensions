import {
  type GetAppointmentQuery,
  type GetAppointmentQueryVariables,
  type GetScheduledAppointmentsQuery,
  type GetScheduledAppointmentsQueryVariables,
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
  createAppointment: jest.fn((args) => {
    return {
      data: {
        createAppointment: {
          appointment: {
            id: 'appointment-id-1',
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
          active_tags: [{ id: 'tag-1' }],
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
  lockFormAnswerGroup: jest.fn((args) => {
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
          user: {
            id: '2345',
          },
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
  getScheduledAppointments: jest.fn<
    { data: GetScheduledAppointmentsQuery },
    [GetScheduledAppointmentsQueryVariables]
  >((args) => {
    const appointments =
      args.appointment_type_id === 'appointment-type-1'
        ? [
            {
              id: 'appointment-1',
            },
          ]
        : []
    return {
      data: {
        appointments,
      },
    }
  }),
  getGoal: jest.fn((args) => {
    return {
      data: {
        goal: {
          user_id: '1234',
        },
      },
    }
  }),
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)
