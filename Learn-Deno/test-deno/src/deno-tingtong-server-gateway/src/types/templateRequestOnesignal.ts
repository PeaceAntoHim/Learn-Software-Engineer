export type TReqOnesignalBroadcastMessage = {
  APP_ID: string;
  REST_API_KEY: string;
  INCLUDED_SEGMENTS?: string;
  // TOKEN_BEARER: string;
  data: Tdata;
};

export type TReqOnesignalTargetingMessage = {
  APP_ID: string;
  REST_API_KEY: string;
  // TOKEN_BEARER: string;
  data: Tdata;
  include_external_user_ids: string[];
};

type Tdata = {
  apps: string;
  title: string;
  msg: string;
  notification_sound?: string;
};
