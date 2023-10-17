import { type EmailInput, type SmsInput } from '../../types'

export const mockedPhoneNumber = {
  from: '+5555551234',
  to: '+5555551235',
}

export const mockedMessageData: SmsInput = {
  messages: [
    {
      destinations: [{ to: mockedPhoneNumber.to }],
      from: mockedPhoneNumber.from,
      text: 'Hello!',
    },
  ],
}

export const mockedEmailData: EmailInput = {
  from: 'from@example.com',
  to: ['from@example.com'],
  html: 'Hello!',
  subject: 'Welcome',
}
