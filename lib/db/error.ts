export class EcomError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string | undefined) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
