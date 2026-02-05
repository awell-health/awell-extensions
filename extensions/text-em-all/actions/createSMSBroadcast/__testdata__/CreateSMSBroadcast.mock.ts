import { type AxiosResponse } from 'axios'

/**
 * Mock response for successful broadcast creation.
 */
export const CreateSMSBroadcastSuccessMockResponse = {
  status: 200,
  statusText: 'OK',
  headers: {
    Location: 'https://staging-rest.call-em-all.com/v1/broadcasts',
  },
  data: {
    Uri: '/v1/broadcasts/10006607',
    UriBroadcastDetails: '/v1/broadcasts/10006607/details',
    BroadcastID: 10006607,
    BroadcastName: 'testBroadcast',
    BroadcastType: 'SMS',
    BroadcastStatus: 'AuthorizationApproved',
    BroadcastStatusCategory: 'Scheduled',
    CreatedDate: '2020-11-20 14:04:09-0600',
    StartDate: '2025-01-02 13:15:00-0000',
    CompletedDate: null,
    TextNumberID: '2142960678',
    TextMessage: 'This is a test text message. Please reply.',
    CreditsUsed: null,
    MaxCreditCost: 1,
    PhoneNumberCount: 1,
    TotalCompleted: 0,
    User: {
      PinCode: null,
      UserID: 215790,
      UserName: null,
      FirstName: null,
      LastName: null,
      Email: null,
      Phone: null,
      CallerID: null,
      IsMasterUser: false,
      AuthToken: null,
      State: null,
      Permissions: null,
    },
  },
} satisfies Partial<AxiosResponse>

/**
 * Mock response for invalid/opted-out phone number.
 * ErrorCode 3005 = NoValidBroadcastContacts
 */
export const InvalidNumberMockResponse = {
  status: 400,
  statusText: 'Bad Request',
  data: {
    ErrorCode: 3005,
    ErrorName: 'NoValidBroadcastContacts',
    ErrorType: 'Informational',
    Message:
      'Unable to create broadcast. None of the contacts are able to receive text messages.',
  },
} satisfies Partial<AxiosResponse>

/**
 * Mock response for rate limiting (429).
 */
export const RateLimitMockResponse = {
  status: 429,
  statusText: 'Too Many Requests',
  data: {},
} satisfies Partial<AxiosResponse>

/**
 * Mock response for generic API error.
 */
export const GenericErrorMockResponse = {
  status: 400,
  statusText: 'Bad Request',
  data: {
    ErrorCode: 9999,
    ErrorName: 'SomeOtherError',
    ErrorType: 'Error',
    Message: 'Something went wrong',
  },
} satisfies Partial<AxiosResponse>
