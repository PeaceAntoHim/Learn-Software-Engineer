import { TDataDeleteUnsubscribed } from "./templateDataDeleteUnsubcribed.ts";

export type TRes = {
  // error code 1 for successful
  // error code -number for failed
  status: number;
  data: Record<
    string,
    string | TResListViewDevices | players[] | TDataDeleteUnsubscribed[]
  >;
  successMessage?: string;
  errMessage?: string;
};

export type TResDelUnsubscribed = {
  success: boolean;
};

export type players = {
  id: string;
  identifier: string;
  session_count: number;
  language: string;
  timezone: number;
  game_version: string;
  device_os: string;
  device_type: number;
  device_model: string;
  ad_id: string;
  tags: Record<string, string>;
  last_active: number | string;
  playtime: number;
  amount_spent: number;
  created_at: number | string;
  invalid_identifier: boolean;
  sdk: string;
  test_type: string;
  ip: string;
  external_user_id: string;
};

export type TResListViewDevices = {
  total_count: number;
  offset: number;
  limit: number;
  players: players[];
};
