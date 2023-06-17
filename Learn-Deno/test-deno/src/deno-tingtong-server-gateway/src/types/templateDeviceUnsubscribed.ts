import { players } from "./templateResponse.ts";

export type TTemplateDeviceUnsubscribed = {
  APP_ID: string;
  REST_API_KEY: string;
  players: players[];
};
