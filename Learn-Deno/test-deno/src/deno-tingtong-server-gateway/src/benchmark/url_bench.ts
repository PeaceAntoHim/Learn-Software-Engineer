import { APP_HOST } from "../../constants.ts";

Deno.bench("URL parsing 1", () => {
  new URL(`http://${APP_HOST}/healthz`);
});

Deno.bench("URL parsing 2", () => {
  new URL(`http://${APP_HOST}/baseAllSegments`);
});

Deno.bench("URL parsing 3", () => {
  new URL(`http://${APP_HOST}/baseExternalId`);
});
