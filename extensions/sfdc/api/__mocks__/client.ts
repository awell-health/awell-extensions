/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  type CreateContactInputType,
  type CreateContactResponseType,
} from '../schema'
import { mockCreateContactResponse } from './mockContact'

export class SalesforceAPIClient {
  createContact = jest.fn(
    (input: CreateContactInputType): CreateContactResponseType => {
      return { ...mockCreateContactResponse, ...input }
    }
  )
}
