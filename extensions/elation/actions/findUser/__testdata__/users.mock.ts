import { type GetAllUsersResponseType } from 'extensions/elation/types'

export const usersMockResponse = {
  count: 63,
  next: null,
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
