import { _pageNotFound } from "../middlewares/pageNotFound.ts";
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import app from "../../server.ts";

Deno.test("Testing page not found", async () => {
  const req = await superoak(app);
  await req
    .get("/")
    .expect(404)
    .expect({
      status: -4,
      errMessage: "Not Found",
      data: {
        msg: "Page not found",
      },
    });
});

Deno.test("Testing path healthz", async () => {
  const req = await superoak(app);
  await req.get("/healthz").expect(200).expect("OK");
});

Deno.test("Testing path bc-msg BO1 create message expect 201", async () => {
  const req = await superoak(app);
  await req
    .post("/bc-msg")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
    .send({
      data: {
        apps: "skype",
        title: "New Message",
        msg: "Test",
        notification_sound: "tokopedia_ringtone",
      },
    })
    .expect(201);
});

Deno.test("Testing path bc-msg BO2 created message expect 201", async () => {
  const req = await superoak(app);
  await req
    .post("/bc-msg")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
    .send({
      data: {
        apps: "skype",
        title: "New Message",
        msg: "Test",
        notification_sound: "tokopedia_ringtone",
      },
    })
    .expect(201);
});

Deno.test(
  "Testing path bc-msg doesn't have bearer token expect 403",
  async () => {
    const req = await superoak(app);
    await req
      .post("/bc-msg")
      .set("Content-Type", "application/json")
      .send({
        data: {
          apps: "skype",
          title: "New Message",
          msg: "Test",
          notification_sound: "tokopedia_ringtone",
        },
      })
      .expect(403)
      .expect("Not OK");
  }
);

Deno.test(
  "Testing path bc-msg BO1 request empty object expected 406",
  async () => {
    const req = await superoak(app);
    await req
      .post("/bc-msg")
      .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
      .send({})
      .expect(406);
  }
);

Deno.test(
  "Testing path bc-msg BO2 request empty object expected 406",
  async () => {
    const req = await superoak(app);
    await req
      .post("/bc-msg")
      .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
      .send({})
      .expect(406);
  }
);

Deno.test("Testing path tg-msg BO1 create message expect 201", async () => {
  const req = await superoak(app);
  await req
    .post("/tg-msg")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
    .send({
      data: {
        apps: "skype",
        title: "New Message",
        msg: "Test",
        notification_sound: "tokopedia_ringtone",
      },
      include_external_user_ids: ["guest55"],
    })
    .expect(201);
});

Deno.test("Testing path tg-msg BO2 created message expect 201", async () => {
  const req = await superoak(app);
  await req
    .post("/tg-msg")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
    .send({
      data: {
        apps: "skype",
        title: "New Message",
        msg: "Test",
        notification_sound: "tokopedia_ringtone",
      },
      include_external_user_ids: ["guest55"],
    })
    .expect(201);
});

Deno.test(
  "Testing path tg-msg doesn't have bearer token expect 403",
  async () => {
    const req = await superoak(app);
    await req
      .post("/tg-msg")
      .set("Content-Type", "application/json")
      .send({
        data: {
          apps: "skype",
          title: "New Message",
          msg: "Test",
          notification_sound: "tokopedia_ringtone",
        },
        include_external_user_ids: ["guest55"],
      })
      .expect(403)
      .expect("Not OK");
  }
);

Deno.test(
  "Testing path tg-msg BO1 request empty object expected 406",
  async () => {
    const req = await superoak(app);
    await req
      .post("/tg-msg")
      .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
      .send({})
      .expect(406);
  }
);

Deno.test(
  "Testing path tg-msg BO2 request empty object expected 406",
  async () => {
    const req = await superoak(app);
    await req
      .post("/tg-msg")
      .set("Authorization", "Bearer YOUR_BEARER_TOKEN")
      .send({})
      .expect(406);
  }
);
