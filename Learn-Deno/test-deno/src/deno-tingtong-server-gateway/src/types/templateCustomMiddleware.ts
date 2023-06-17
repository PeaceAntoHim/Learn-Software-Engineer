import { Middleware } from "../helpers/deps.ts";
import { TTemplateClient } from "./templateConfigClient.ts";
import { TTemplateDeviceUnsubscribed } from "./templateDeviceUnsubscribed.ts";
import { TTemplateListViewDevices } from "./templateListViewDevices.ts";

export type TClientMiddleware = Middleware<{ client: TTemplateClient }>;

export type TListViewDevicesMiddleware = Middleware<
  { client: TTemplateListViewDevices }
>;

export type TDeviceUnsubscribed = Middleware<
  { client: TTemplateDeviceUnsubscribed }
>;
