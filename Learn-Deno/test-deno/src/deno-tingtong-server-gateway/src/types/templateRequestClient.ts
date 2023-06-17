// import vs from "../helpers/deps.ts";
import { z } from "../helpers/deps.ts";

export const StrictTReqClientBC = z.object({
  data: z.object({
    apps: z.string(),
    title: z.string(),
    msg: z.string(),
    notification_sound: z.string().optional(),
  }),
}).strict();

export type TReqClientBroadcastMessage = z.infer<typeof StrictTReqClientBC>;

export const StrictTReqClientTG = z.object({
  data: z.object({
    apps: z.string(),
    title: z.string(),
    msg: z.string(),
    notification_sound: z.string().optional(),
  }),
  include_external_user_ids: z.array(z.string()),
}).strict();

export type TReqClientTargetingMessage = z.infer<typeof StrictTReqClientTG>;
