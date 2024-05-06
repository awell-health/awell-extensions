/* eslint-disable @typescript-eslint/explicit-function-return-type */

export const StripeMockImplementation = {
  createCustomer: jest.fn(() => {
    return { id: 'new-customer-id' }
  }),

  createSubscription: jest.fn(() => {
    return { id: 'new-subscription-id' }
  }),
}

const StripeMock = jest.fn(() => StripeMockImplementation)

export const Stripe = StripeMock
