class EcomError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EcomError.prototype);
  }
}

export default EcomError;
