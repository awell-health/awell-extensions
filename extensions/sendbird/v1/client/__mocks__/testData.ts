import { ChannelType, type Customer, type User } from '../../types'

export const mockedDates = {
  timestamp: 1690848000,
  iso: '2023-08-01T00:00:00.000Z',
}

export const mockedUserData: User = {
  user_id: 'user-1',
  nickname: 'Johnny',
  profile_url: 'https://sendbird.com/main/img/profiles/profile_05_512px.png',
  access_token: 'accessToken',
  is_active: true,
  // 2023-08-01T00:00:00.000Z
  created_at: mockedDates.timestamp,
  // 2023-08-01T00:00:00.000Z
  last_seen_at: mockedDates.timestamp,
  has_ever_logged_in: true,
  metadata: {
    email: 'test@test.com',
  },
}

export const mockedCustomerData: Customer = {
  id: 1,
  displayName: 'Johnny',
  sendbirdId: 'Johnny',
  channelType: ChannelType.SENDBIRD,
  project: 1,
  createdAt: mockedDates.iso,
  customFields: [
    {
      id: 1,
      key: 'email',
      value: 'test@test.com',
    },
  ],
}
