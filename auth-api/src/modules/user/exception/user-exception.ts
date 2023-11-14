export class UserException extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this.constructor)
  }
}