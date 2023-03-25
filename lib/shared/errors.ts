export class AuthError extends Error {
  readonly code: number
  public message: string
  public get Code(): number {
    return this.code
  }

  public constructor(message: string, code?: number) {
    const proto = new.target.prototype
    super()
    this.code = code === undefined ? 500 : code
    this.message = message
    Object.setPrototypeOf(this, proto)
  }
}
