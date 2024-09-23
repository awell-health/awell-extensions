/* eslint-disable @typescript-eslint/explicit-function-return-type */

import {
  type CreateRecordInputType,
  type CreateRecordResponseType,
  type UpdateRecordInputType,
  type UpdateRecordResponseType,
} from '../schema'
import { mockCreateRecordResponse, mockGetRecordResponse } from './mockRecord'

export class SalesforceRestAPIClient {
  createRecord = jest.fn(
    (input: CreateRecordInputType): CreateRecordResponseType => {
      return mockCreateRecordResponse
    }
  )

  updateRecord = jest.fn(
    (input: UpdateRecordInputType): UpdateRecordResponseType => {
      // 204 status code
      return undefined
    }
  )

  getRecordShape = jest.fn(() => {
    return {
      label: 'Lead',
    }
  })

  getRecord = jest.fn(() => {
    return mockGetRecordResponse
  })
}
