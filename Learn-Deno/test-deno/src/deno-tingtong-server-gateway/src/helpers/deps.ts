const TAG = "deps";
console.log(`--> ${TAG}: has been cached`);

export { Response } from "https://deno.land/x/oak@v11.1.0/response.ts";
export { Request } from "https://deno.land/x/oak@v11.1.0/request.ts";
export {
  Application,
  isHttpError,
  Router,
  Status,
  STATUS_TEXT,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";
export { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";
export type { Middleware } from "https://deno.land/x/oak@v11.1.0/middleware.ts";
export * from "https://deno.land/x/zod@v3.20.2/mod.ts";

// export { config } from "https://deno.land/x/dotenv@v1.0.1/mod.ts";
