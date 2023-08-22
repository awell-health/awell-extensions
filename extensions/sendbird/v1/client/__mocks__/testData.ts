import {
  ChannelType,
  type Ticket,
  type Customer,
  type User,
  TicketPriority,
  type Group,
} from '../../types'

// both dates are equal
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
  created_at: mockedDates.timestamp,
  last_seen_at: mockedDates.timestamp,
  has_ever_logged_in: true,
  metadata: {
    email: 'test@test.com',
  },
}

export const mockedCustomerData: Customer = {
  id: 1,
  displayName: mockedUserData.nickname,
  sendbirdId: mockedUserData.user_id,
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

export const mockedGroupData: Group = {
  id: 1,
  createdAt: mockedDates.iso,
  key: 'issue-1',
  name: 'Issue team',
}

export const mockedTicketData: Ticket = {
  id: 1,
  channelName: 'Issue #1',
  channelUrl: 'sendbird_group_channel_1_1',
  relatedChannels: 'sendbird_group_channel_1_1',
  createdAt: mockedDates.iso,
  closedAt: mockedDates.iso,
  issuedAt: mockedDates.iso,
  customer: mockedCustomerData,
  customFields: mockedCustomerData.customFields,
  priority: TicketPriority.URGENT,
  group: mockedGroupData,
}
