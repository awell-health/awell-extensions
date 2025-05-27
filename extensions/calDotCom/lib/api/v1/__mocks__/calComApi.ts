export const sampleBooking = {
  id: 11223344,
  userId: 182,
  user: 'john-doe-e27xkb',
  description: null,
  eventTypeId: 2323232,
  uid: 'stoSJtnh83PEL4rZmqdHe2',
  title: 'Debugging between Syed Ali Shahbaz and Hello Hello',
  startTime: '2023-09-26T13:00:00Z',
  endTime: '2023-09-26T13:30:00Z',
  metadata: {},
  status: 'ACCEPTED',
  timeZone: 'Europe/London',
  language: 'en',
  responses: {
    email: 'john.doe@example.com',
    name: 'John Doe',
    location: 'Calcom HQ',
  },
}

export const mockReturnValue = {
  createBooking: jest.fn((params) => {
    return sampleBooking
  }),
  getBooking: jest.fn((params) => {
    return sampleBooking
  }),
  updateBooking: jest.fn((params) => {
    return sampleBooking
  }),
  deleteBooking: jest.fn((params) => {}),
}

const mock = jest.fn().mockImplementation((params) => {
  console.log('Calling mock cal.com api constructor', params)

  return mockReturnValue
})

export default mock
