export enum ResponseCode {
  Success = 'Success',
  BadApiKey = 'BadApiKey',
  BadAuthorizationHeader = 'BadAuthorizationHeader',
  BadJsonBody = 'BadJsonBody',
  BadParams = 'BadParams',
  BatchTooLarge = 'BatchTooLarge',
  DatabaseError = 'DatabaseError',
  EmailAlreadyExists = 'EmailAlreadyExists',
  ExternalKeyConflict = 'ExternalKeyConflict',
  Forbidden = 'Forbidden',
  ForbiddenParamsError = 'ForbiddenParamsError',
  ForgottenUserError = 'ForgottenUserError',
  GenericError = 'GenericError',
  InvalidEmailAddressError = 'InvalidEmailAddressError',
  InvalidJwtPayload = 'InvalidJwtPayload',
  InvalidUserIdError = 'InvalidUserIdError',
  JwtUserIdentifiersMismatched = 'JwtUserIdentifiersMismatched',
  NotFound = 'NotFound',
  QueueEmailError = 'QueueEmailError',
  RateLimitExceeded = 'RateLimitExceeded',
  RequestFieldsTypesMismatched = 'RequestFieldsTypesMismatched',
  Unauthorized = 'Unauthorized',
  UniqueFieldsLimitExceeded = 'UniqueFieldsLimitExceeded',
  UnknownEmailError = 'UnknownEmailError',
  UnknownUserIdError = 'UnknownUserIdError',
  UserIdAlreadyExists = 'UserIdAlreadyExists',
}

export interface ApiResponse {
  msg: string
  code: ResponseCode
  params?: Record<string, unknown>
}

export interface SendEmailRequest {
  campaignId: number
  recipientEmail?: string
  recipientUserId?: string
  dataFields?: Record<string, unknown>
  sendAt?: string
  allowRepeatMarketingSends?: boolean
  metadata?: Record<string, unknown>
}

export interface TrackEventRequest {
  eventName: string
  email?: string
  userId?: string
  id?: string
  dataFields?: Record<string, unknown>
  createdAt?: number
  campaignId?: number
  templateId?: number
  createNewFields?: boolean
}
