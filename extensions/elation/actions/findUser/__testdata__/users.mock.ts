import { type GetAllUsersResponseType } from 'extensions/elation/types'

const TOTAL_USERS = 4

export const usersMockResponsePageOne = {
  count: TOTAL_USERS,
  next: 'https://app.elationemr.com/api/2.0/users/?limit=2&offset=0',
  previous: null,
  results: [
    {
      id: 1,
      email: 'johndoe@example.com',
      first_name: 'John',
      is_active: true,
      last_name: 'Doe',
      practice: 12345,
      user_type: 'physician',
      is_practice_admin: true,
      has_chart_access: true,
      physician_qualifications: null,
    },
    {
      id: 2,
      email: 'melanie.smith@example.com',
      first_name: 'Melanie',
      is_active: true,
      last_name: 'Smith',
      practice: 141114865745924,
      user_type: 'staff',
      is_practice_admin: false,
      has_chart_access: true,
      physician_qualifications: null,
    },
  ],
} satisfies GetAllUsersResponseType

export const usersMockResponsePageTwo = {
  count: TOTAL_USERS,
  next: null,
  previous: 'https://app.elationemr.com/api/2.0/users/?limit=2&offset=0',
  results: [
    {
      id: 3,
      email: 'johanna.doe@example.com',
      first_name: 'Johanna',
      is_active: true,
      last_name: 'Doe',
      practice: 12345,
      user_type: 'physician',
      is_practice_admin: true,
      has_chart_access: true,
      physician_qualifications: null,
    },
    {
      id: 4,
      email: 'awell.doe@example.com',
      first_name: 'Awell',
      is_active: true,
      last_name: 'Doe',
      practice: 12345,
      user_type: 'physician',
      is_practice_admin: false,
      has_chart_access: true,
      physician_qualifications: null,
    },
  ],
} satisfies GetAllUsersResponseType
