import { type AppointmentResponse } from '../../../types'
import { faker } from '@faker-js/faker'
interface RequiredAppointmentProps {
  scheduled_date: string
  reason: string
  status: AppointmentResponse['status']['status']
}

export const generateMockAppointment = (
  required: RequiredAppointmentProps,
  overrides: Partial<
    Omit<AppointmentResponse, keyof RequiredAppointmentProps>
  > = {},
): AppointmentResponse => ({
  id: faker.number.int({ min: 1, max: 999999 }),
  scheduled_date: required.scheduled_date,
  duration: 60,
  billing: undefined,
  payment: undefined,
  time_slot_type: 'appointment',
  time_slot_status: 'available',
  reason: required.reason,
  mode: faker.lorem.word(),
  description: '',
  status: {
    status: required.status,
    room: undefined,
    status_date: faker.date.recent().toISOString(),
    status_detail: undefined,
  },
  patient: faker.number.int({ min: 10000, max: 99999 }),
  physician: faker.number.int({ min: 100000000000000, max: 999999999999999 }),
  practice: faker.number.int({ min: 100000000000000, max: 999999999999999 }),
  recurring_event_schedule: undefined,
  metadata: undefined,
  created_date: faker.date.recent().toISOString(),
  last_modified_date: faker.date.recent().toISOString(),
  deleted_date: undefined,
  service_location: {
    id: faker.number.int({ min: 1, max: 999 }),
    name: faker.company.name(),
    place_of_service: faker.number.int({ min: 1, max: 99 }),
    address_line1: faker.location.streetAddress(),
    address_line2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
    phone: faker.phone.number(),
  },
  telehealth_details: '',
  ...overrides,
})
