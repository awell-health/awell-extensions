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
