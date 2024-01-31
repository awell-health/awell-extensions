export const mockGetSdkReturn = {
  getChartingItems: jest.fn((args) => {
    return {
      data: {
        // chartingItems: null
      },
    }
  }),
  getScheduledAppointments: jest.fn((args) => {
    return {
      data: {},
    }
  }),
  getConversationMemberships: jest.fn((args) => {
    return {
      data: {},
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
}

export const mockGetSdk = (params: any): any => {
  return mockGetSdkReturn
}

export const getSdk = jest.fn(mockGetSdk)
