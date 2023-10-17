import { mockedPhoneNumber } from './testData'

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
}

const InfobipClientMock = jest.fn(() => InfobipClientMockImplementation)

export const InfobipClient = InfobipClientMock

export const isInfobipError = jest.fn()
