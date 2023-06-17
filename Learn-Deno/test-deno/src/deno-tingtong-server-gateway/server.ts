import router from "./router.ts";
import { APP_HOST, APP_PORT } from "./constants.ts";
import { Application, Context } from "./src/helpers/deps.ts";
import { _pageNotFound } from "./src/middlewares/pageNotFound.ts";
import { errorHandler } from "./src/middlewares/errorHandler.ts";
import { configHandler } from "./src/middlewares/configHandler.ts";

const TAG = "Server";

console.log(`--> ${TAG}: application has been called`);
// Initialized new application
const app = new Application();

// Middlware to control error handling
app.use(errorHandler);

// Middleware to logger timeing from server
app.use(async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
  await next();
  const rt: string | null = ctx.response.headers.get("X-Response-Time");
  console.log(`--> ${TAG}: ${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Middleware to calculate timeing from server
app.use(async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
  const start: number = Date.now();
  await next();
  const ms: number = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Middleware to control config handling
app.use(configHandler);

// Middlware to control routes
app.use(router.routes());

// Middlware to allowed routes methods
app.use(router.allowedMethods());

// Middlware to handle all not found api routes
app.use(_pageNotFound);

console.log(
  `--> ${TAG}: Listening on host ${APP_HOST} and on port ${APP_PORT} ...`,
);
// This to create and host and port for http request server
app.listen({ hostname: APP_HOST, port: APP_PORT });

console.log(`--> ${TAG}: application has been ended`);
export default app;
