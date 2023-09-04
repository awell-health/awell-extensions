export const sampleBooking = {
  id: 11223344,
  userId: 182,
  description: null,
  eventTypeId: 2323232,
  uid: 'stoSJtnh83PEL4rZmqdHe2',
  title: 'Debugging between Syed Ali Shahbaz and Hello Hello',
  startTime: '2023-05-24T13:00:00.000Z',
  endTime: '2023-05-24T13:30:00.000Z',
  metadata: {},
  status: 'CANCELLED',
  responses: {
    email: 'john.doe@example.com',
    name: 'John Doe',
    location: {
      optionValue: '',
      value: 'inPerson',
    },
  },
}

export const mockReturnValue = {
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
