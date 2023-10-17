import { type SmsInput } from '../../types'

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
