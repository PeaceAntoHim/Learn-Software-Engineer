import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { APP_HOST } from "../../constants.ts";

Deno.test("Url api gateway test 1", (): void => {
  const url_1 = new URL("./healthz", `http://${APP_HOST}/}`);
  assertEquals(url_1.href, `http://${APP_HOST}/healthz`);
});

Deno.test("Url api gateway test 2", (): void => {
  const url = new URL("./bc-msg", `http://${APP_HOST}/`);
  assertEquals(url.href, `http://${APP_HOST}/bc-msg`);
});

Deno.test("Url api gateway test 3", (): void => {
  const url = new URL("./tg-msg", `http://${APP_HOST}/`);
  assertEquals(url.href, `http://${APP_HOST}/tg-msg`);
});
