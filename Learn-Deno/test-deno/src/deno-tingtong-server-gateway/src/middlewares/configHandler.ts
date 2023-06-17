import { Status } from "../helpers/deps.ts";
import { CONFIG_CLIENT, CONFIG_ROUTES_NEED_TOKEN } from "../../constants.ts";
import { TClientMiddleware } from "../types/templateCustomMiddleware.ts";
import { CustomError } from "../class/CustomError.ts";

export const configHandler: TClientMiddleware = async (
  context,
  nextFn,
) => {
  const TAG = "configHandler";
  console.log(`--> ${TAG}: has been called`);
  // This to get barrear token from request client and the data would be split into to array strin for string[0] and string[1] we need to access data string[1]
  const barrearToken =
    context.request.headers.get("Authorization")?.split("Bearer") ||
    "";
  const contentType = context.request.headers.get("Content-Type");
  const method = context.request.method;

  if (contentType != "application/json" && method === "POST") {
    throw new CustomError(
      -4,
      {
        msg: "Content type is not json",
      },
      Status.NotAcceptable,
    );
  } else if (
    CONFIG_ROUTES_NEED_TOKEN.includes(context.request.url.pathname)
  ) {
    if (
      barrearToken && barrearToken[1] &&
      CONFIG_CLIENT[barrearToken[1].trim()]
    ) {
      context.state.client = CONFIG_CLIENT[barrearToken[1].trim()],
        await nextFn();
      return;
    } else {
      context.response.body = "Not OK";
      context.response.status = Status.Forbidden;
      return;
    }
  }
  await nextFn();
  console.log(`--> ${TAG}: has been ended`);
  return;
};
