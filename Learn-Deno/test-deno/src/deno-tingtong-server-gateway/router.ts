import { Router } from "./src/helpers/deps.ts";
import { createBroadcastMessage } from "./src/controllers/broadcastMessageController.ts";
import { createTargetingMessage } from "./src/controllers/targetingMessageController.ts";
import getStatusServer from "./src/controllers/checkStatusServerController.ts";
import { getAllListViewDevices } from "./src/controllers/listAllViewDevicesController.ts";
import { deleteDeviceUnsubscribed } from "./src/controllers/deviceUnsubscribedController.ts";
import { getSubscribedListViewDevices } from "./src/controllers/listSubscribedDeviceController.ts";
import { getUnsubscribedListViewDevices } from "./src/controllers/listUnsubcribedViewDevicesController.ts";

const TAG = "router";
console.log(`--> ${TAG}: has been called`);
const router = new Router();

router
  .get("/healthz", getStatusServer)
  .get("/list-devices/all", getAllListViewDevices)
  .get("/list-devices/subscribed", getSubscribedListViewDevices)
  .get("/list-devices/unsubscribed", getUnsubscribedListViewDevices)
  .post("/bc-msg", createBroadcastMessage)
  .post("/tg-msg", createTargetingMessage)
  .delete("/devices/remove-unsubscribed", deleteDeviceUnsubscribed);

console.log(`--> ${TAG}: has been ended`);
export default router;
