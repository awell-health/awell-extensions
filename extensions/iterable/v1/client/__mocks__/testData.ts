import { type SendEmailRequest } from '../types'

export const mockedDates = {
  iso: '2023-08-01 00:00:00',
}

export const mockedSendEmailData: SendEmailRequest = {
  campaignId: 123,
  recipientEmail: 'test@example.com',
  recipientUserId: undefined,
  dataFields: {},
  sendAt: mockedDates.iso,
  allowRepeatMarketingSends: true,
  metadata: {},
}
