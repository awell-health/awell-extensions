export type Metadata = Record<string, string>

export interface User {
  user_id: string
  nickname: string
  profile_url: string
  metadata?: Metadata
  access_token?: string
  is_active: boolean
  created_at: number
  last_seen_at: number
  has_ever_logged_in: boolean
}

export interface CreateUserInput
  extends Pick<User, 'user_id' | 'nickname' | 'profile_url' | 'metadata'> {
  issue_access_token?: boolean
}

export interface UpdateUserInput
  extends Pick<User, 'user_id'>,
    Partial<Pick<User, 'nickname' | 'profile_url' | 'is_active'>> {
  issue_access_token?: boolean
  leave_all_when_deactivated?: boolean
}

export interface CustomField {
  id: number
  key: string
  value: string
}

export enum ChannelType {
  SENDBIRD = 'SENDBIRD',
  FACEBOOK_PAGE = 'FACEBOOK_PAGE',
  TWITTER_USER = 'TWITTER_USER',
  INSTAGRAM_USER = 'INSTAGRAM_USER',
  WHATSAPP_USER = 'WHATSAPP_USER',
}

export interface Customer {
  id: number
  sendbirdId: string
  channelType: ChannelType
  project: number
  displayName: string
  customFields: CustomField[]
  createdAt: string
}

export interface CreateCustomerInput {
  sendbirdId: string
}

export interface UpdateCustomerCustomFieldsInput {
  customerId: number
  // ! JSON string
  customFields: string
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Group {
  id: number
  name: string
  key: string
  createdAt: string
}

export interface Ticket {
  id: number
  channelName: string
  customer: Customer
  group: Group
  customFields: CustomField[]
  priority: TicketPriority
  createdAt: string
  issuedAt: string
  closedAt: string
  channelUrl: string
  relatedChannels?: string
}

export interface CreateTicketInput extends Pick<Ticket, 'channelName'> {
  customerId: number
  groupKey?: string
  // ! JSON string
  customFields?: string
  priority?: TicketPriority
  relatedChannelUrls?: string
}
