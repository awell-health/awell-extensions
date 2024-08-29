import { isEmpty } from 'lodash'

export class FetchError extends Error {
  statusCode: number
  statusText: string
  responseBody: string

  constructor(statusCode: number, statusText: string, responseBody?: unknown) {
    super(`${statusCode} ${statusText}`)
    this.statusCode = statusCode
    this.statusText = statusText
    this.responseBody = isEmpty(responseBody)
      ? ''
      : JSON.stringify(responseBody)
  }
}
