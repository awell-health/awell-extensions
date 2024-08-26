export class ResponseError extends Error {
  response: Response

  constructor(message: string, res: Response) {
    super(message)
    this.response = res
  }
}
