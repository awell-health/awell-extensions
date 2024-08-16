/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  type CreateRecordInputType,
  type CreateRecordResponseType,
} from '../schema'
import { mockCreateRecordResponse } from './mockRecord'

export class SalesforceRestAPIClient {
  createRecord = jest.fn(
    (input: CreateRecordInputType): CreateRecordResponseType => {
      return mockCreateRecordResponse
    }
  )

  getRecordShape = jest.fn(() => {
    return {
      label: 'Lead',
    }
  })
}
