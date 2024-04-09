import { type SendEmailRequest } from '../types'

export const mockedDates = {
  iso: '2023-08-01 00:00:00',
}

export const mockedSendEmailData: SendEmailRequest = {
  campaignId: 123,
  recipientEmail: 'test@example.com',
  recipientUserId: undefined,
  dataFields: {},
  sendAt: undefined,
  allowRepeatMarketingSends: true,
  metadata: {},
}

export const mockTrackEventActionFields = {
  eventName: 'Some name',
  email: mockedSendEmailData.recipientEmail,
  userId: mockedSendEmailData.recipientUserId,
  dataFields: { dateField1: 'hello', dateField2: 'world' },
}
