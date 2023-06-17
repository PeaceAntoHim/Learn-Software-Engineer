import { broadcastMessageResponse } from "../services/oneSignalService.ts";
import { TRes } from "../types/templateResponse.ts";
import { Status, STATUS_TEXT } from "../helpers/deps.ts";
import { TClientMiddleware } from "../types/templateCustomMiddleware.ts";
import { TTemplateClient } from "../types/templateConfigClient.ts";
import {
  StrictTReqClientBC,
  TReqClientBroadcastMessage,
} from "../types/templateRequestClient.ts";
import { TReqOnesignalBroadcastMessage } from "../types/templateRequestOnesignal.ts";
import { CustomError } from "../class/CustomError.ts";

export const createBroadcastMessage: TClientMiddleware = async (
  context,
) => {
  const TAG = "createBroadcastMessage";
  console.log(`--> ${TAG}: has been called`);
  const body = context.request.body();
  const dataLocalsObj: TTemplateClient = context.state.client;
  const dataBodyObj: TReqClientBroadcastMessage = await body
    .value;
  // This data object will used for sending the request for onesignal
  const dataObj: TReqOnesignalBroadcastMessage = {
    ...dataBodyObj,
    ...dataLocalsObj,
  };
  // This to check type of request client to stricted
  const result = StrictTReqClientBC.safeParse(dataBodyObj);
  if (!result.success) {
    throw new CustomError(
      -4,
      {
        msg: result.error.issues[0]["message"],
        logger: result.error.message,
      },
      Status.NotAcceptable,
    );
  }
  // If message successfully being pushed to the onesignal server
  const msgJson: JSON = await broadcastMessageResponse(dataObj);
  const res: TRes = {
    status: 1,
    successMessage: STATUS_TEXT[Status.Created],
    data: {
      msg: "Message successfully pushed",
      logger: JSON.stringify(msgJson),
    },
  };
  console.log(msgJson);
  context.response.body = res;
  context.response.status = Status.Created;
  console.log(`--> ${TAG}: has been called`);
  return;
};
