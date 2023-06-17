import { CustomError } from "../class/CustomError.ts";
import { Status } from "../helpers/deps.ts";
import { TDataDeleteUnsubscribed } from "../types/templateDataDeleteUnsubcribed.ts";
import { TTemplateDeviceUnsubscribed } from "../types/templateDeviceUnsubscribed.ts";
import { TTemplateListViewDevices } from "../types/templateListViewDevices.ts";
import {
  TReqOnesignalBroadcastMessage,
  TReqOnesignalTargetingMessage,
} from "../types/templateRequestOnesignal.ts";
import {
  players as _players,
  TResListViewDevices,
} from "../types/templateResponse.ts";

// This functio n is responsible for creating message for all subscribers users
export const broadcastMessageResponse = async (
  objData: TReqOnesignalBroadcastMessage,
): Promise<JSON> => {
  const TAG = "broadCastMessageResponse";
  console.log(`--> ${TAG}: has been called`);
  const payload = {
    app_id: objData.APP_ID,
    included_segments: objData.INCLUDED_SEGMENTS || "Active Users",
    data: {
      apps: objData.data.apps,
      title: objData.data.title,
      notification_sound: objData.data.notification_sound || "custom_ringtone",
    },
    contents: {
      en: objData.data.msg,
    },
  };

  const res: Response = await fetch(
    "https://onesignal.com/api/v1/notifications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + objData.REST_API_KEY,
      },
      body: JSON.stringify(payload),
    },
  );

  if (res.status >= 400) {
    throw new CustomError(
      -4,
      {
        msg: "Error from third party",
        logger: await res.json(),
      },
      Status.BadRequest,
    );
  }
  console.log(`--> ${TAG}: has been ended`);
  return res.json();
};

// This function is responsible for creating message for external users id
export const targetingMessageResponse = async (
  objData: TReqOnesignalTargetingMessage,
): Promise<JSON> => {
  const TAG = "targetingMessageResponse";
  console.log(`--> ${TAG}: has been called`);
  const payload = {
    app_id: objData.APP_ID,
    include_external_user_ids: objData.include_external_user_ids,
    channel_for_external_user_ids: "push",
    data: {
      apps: objData.data.apps,
      title: objData.data.title,
      notification_sound: objData.data.notification_sound || "custom_ringtone",
    },
    contents: {
      en: objData.data.msg,
    },
  };

  const res: Response = await fetch(
    "https://onesignal.com/api/v1/notifications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + objData.REST_API_KEY,
      },
      body: JSON.stringify(payload),
    },
  );

  if (res.status >= 400) {
    throw new CustomError(
      -4,
      {
        msg: "Error from third party",
        logger: await res.json(),
      },
      Status.BadRequest,
    );
  }
  console.log(`--> ${TAG}: has been ended`);
  return res.json();
};

// This function is responsible for get all players devices
export const listAllDeviceResponse = async (
  objData: TTemplateListViewDevices,
): Promise<TResListViewDevices> => {
  const TAG = "listDeviceResponse";
  const res: Response = await fetch(
    `https://onesignal.com/api/v1/players?app_id=${objData.APP_ID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + objData.REST_API_KEY,
      },
    },
  );
  if (res.status >= 400) {
    throw new CustomError(
      -4,
      {
        msg: "Error from third party",
        logger: await res.json(),
      },
      Status.BadRequest,
    );
  }
  console.log(`--> ${TAG}: has been ended`);
  return res.json();
};

// This function is responsible for deleted all players unsubscribed devices
export const deviceUnsubscribedResponse = async (
  objData: TTemplateDeviceUnsubscribed,
): Promise<TDataDeleteUnsubscribed[]> => {
  const TAG = "deviceUnsubscribedResponse";
  console.log(`--> ${TAG}: has been called`);
  const players: _players[] = objData.players;
  const dataRes: TDataDeleteUnsubscribed[] = [];

  await Promise.all(
    players.map(async (player) => {
      const res: Response = await fetch(
        `https://onesignal.com/api/v1/players/${player.id}?app_id=${objData.APP_ID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic " + objData.REST_API_KEY,
          },
        },
      );
      if (res.status >= 400) {
        throw new CustomError(
          -4,
          {
            msg: "Error from third party",
            logger: await res.json(),
          },
          Status.BadRequest,
        );
      }
      dataRes.push({ player_id: player.id, status: await res.json() });
    }),
  );
  console.log(`--> ${TAG}: has been ended`);
  return dataRes;
};
