import configClient from "./config/client.json" assert { type: "json" };
import configRoutes from "./config/routes.json" assert { type: "json" };
import { TEnvProd } from "./src/types/templateEnvProd.ts";
import { TEnvLocal } from "./src/types/templateEnvLocal.ts";

const TAG = "constants";

console.log(`--> ${TAG}: has been cached`);
export const APP_HOST = "0.0.0.0";
export const APP_PORT = 5000;

// This to check if the environment when running production
export const CONFIG_CLIENT = Deno.env.get("CONFIG") != undefined
  ? JSON.parse(Deno.env.get("CONFIG") as string) as TEnvProd
  : configClient as TEnvLocal;
// This to create routes can be accessed used bearer token
export const CONFIG_ROUTES_NEED_TOKEN = configRoutes.NEED_TOKEN;
