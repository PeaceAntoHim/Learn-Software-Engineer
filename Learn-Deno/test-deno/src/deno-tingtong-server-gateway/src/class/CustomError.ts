import { Status, STATUS_TEXT } from "../helpers/deps.ts";

export class CustomError extends Error {
  #status: number;
  #errMessage: string;
  #data: { msg: string; logger?: string };
  #statusCode: Status;

  constructor(
    status: number,
    data: { msg: string; logger?: string },
    statusCode: Status,
  ) {
    super();
    this.#status = status;
    this.#data = data;
    this.#statusCode = statusCode;
    this.#errMessage = STATUS_TEXT[statusCode];
  }

  get status() {
    return this.#status;
  }

  get errMessage() {
    return this.#errMessage;
  }

  get data() {
    return this.#data;
  }

  get statusCode() {
    return this.#statusCode;
  }
}
