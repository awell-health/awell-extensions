export const mockMessageResponse = {
  message: {
    message: {
      id: 'message-1',
      subject: 'Test Message Subject',
      body: '<p>This is a test message body</p>',
      format: 'HTML',
      attachments: null
    }
  }
};

export const mockEmptyMessageResponse = {
  message: {
    message: null
  }
};

export const mockMessageActivityWithId = {
  id: 'message-activity-1',
  date: '2023-01-02T10:00:00.000Z',
  action: 'SENT',
  status: 'DONE',
  resolution: 'SUCCESS',
  subject: {
    type: 'AWELL',
    name: 'Awell'
  },
  object: {
    type: 'MESSAGE',
    name: 'Test Message',
    id: 'message-1'
  },
  context: {
    track_id: 'test-track-id',
    step_id: 'step-1'
  }
};

export const mockMessageActivityWithoutId = {
  id: 'message-activity-2',
  date: '2023-01-02T11:00:00.000Z',
  action: 'SENT',
  status: 'DONE',
  resolution: 'SUCCESS',
  subject: {
    type: 'AWELL',
    name: 'Awell'
  },
  object: {
    type: 'MESSAGE',
    name: 'Test Message Without ID'
  },
  context: {
    track_id: 'test-track-id',
    step_id: 'step-1'
  }
}; 