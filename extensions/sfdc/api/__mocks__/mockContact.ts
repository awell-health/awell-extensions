import { CreateContactResponseType } from '../schema'

export const mockCreateContactResponse: CreateContactResponseType = {
  operationStatus: 'OK',
  rowsAffetcted: 1,
  contactKey: 'acruz@example.com',
  contactId: 12345678,
  contactTypeID: 0,
  isNewContactKey: false,
  requestServiceMessageID: '8b51b524-28c1-46fc-9a44-02fca5b0a08c',
  hasErrors: false,
  resultMessages: [],
  serviceMessageID: '80676c59-ceb9-48aa-ad35-81e150094a17',
}
