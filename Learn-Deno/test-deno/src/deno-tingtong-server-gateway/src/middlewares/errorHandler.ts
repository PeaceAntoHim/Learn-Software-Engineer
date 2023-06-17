import { TRes } from "../types/templateResponse.ts";
import {
  isHttpError,
  Middleware,
  Status,
  STATUS_TEXT,
} from "../helpers/deps.ts";

export const errorHandler: Middleware = async (
  context,
  nextFn,
) => {
  const TAG = "errorHandler";
  try {
    console.log(`--> ${TAG}: try has been called`);
    await nextFn();
    console.log(`--> ${TAG}: try has been ended`);
  } catch (err) {
    if (!isHttpError(err)) {
      console.log(`--> ${TAG}: catch has been called`);
      const res: TRes = {
        status: err.status || -5,
        errMessage: err.errMessage || STATUS_TEXT[Status.InternalServerError],
        data: err.data || { msg: "Unexpected error", logger: err.message },
      };
      context.response.body = res;
      context.response.status = err.statusCode || Status.InternalServerError;
    } else {
      const res: TRes = {
        status: -5,
        errMessage: STATUS_TEXT[Status.InternalServerError],
        data: { msg: err.message },
      };
      context.response.body = res;
      context.response.status = Status.InternalServerError;
    }
    console.log(`--> ${TAG}: catch has been ended`);
  }
};
