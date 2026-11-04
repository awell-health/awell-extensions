import { mockedEmailData, mockedPhoneNumber } from './testData'

export const InfobipClientMockImplementation = {
  smsApi: {
    send: jest.fn((arg) => ({
      data: {
        bulkId: 'xyz',
        messages: [
          {
            messageId: '123',
            to: mockedPhoneNumber.to,
          },
        ],
      },
    })),
  },
  emailApi: {
    send: jest.fn((arg) => ({
      data: {
        bulkId: 'xyz',
        messages: [
          {
            messageId: '123',
            to: mockedEmailData.to,
            status: {
              groupId: 1,
              groupName: 'PENDING',
              id: 26,
              name: 'PENDING_ACCEPTED',
              description: 'Message accepted, pending for delivery.',
            },
          },
        ],
      },
    })),
  },
}

const InfobipClientMock = jest.fn(() => InfobipClientMockImplementation)

export const InfobipClient = InfobipClientMock

export const isInfobipError = jest.fn()
