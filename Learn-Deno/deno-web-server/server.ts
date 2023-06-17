import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import router from "./router.ts"
import { APP_HOST, APP_PORT } from "./config.ts";
import _pageNotFound from "./src/controllers/pageNotFound.ts";
import errorHandler from "./src/controllers/errorHandler.ts";


// Initialized new application
const app = new Application();

app.use(errorHandler);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(_pageNotFound);
console.log(`Listening on host ${APP_HOST} and on port ${APP_PORT} ...`);
await app.listen(`${APP_HOST}:${APP_PORT}`);