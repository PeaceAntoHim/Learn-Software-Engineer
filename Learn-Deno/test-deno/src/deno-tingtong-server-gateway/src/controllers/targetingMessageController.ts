import { targetingMessageResponse } from "../services/oneSignalService.ts";
import { TRes } from "../types/templateResponse.ts";
import { Status, STATUS_TEXT } from "../helpers/deps.ts";
import { TClientMiddleware } from "../types/templateCustomMiddleware.ts";
import { TTemplateClient } from "../types/templateConfigClient.ts";
import {
  StrictTReqClientTG,
  TReqClientTargetingMessage,
} from "../types/templateRequestClient.ts";
import { TReqOnesignalTargetingMessage } from "../types/templateRequestOnesignal.ts";
import { CustomError } from "../class/CustomError.ts";

export const createTargetingMessage: TClientMiddleware = async (
  context,
) => {
  const TAG = "targetingMessageController";
  console.log(`--> ${TAG}: has been called`);
  const body = context.request.body();
  const dataLocalsObj: TTemplateClient = context.state.client;
  const dataBodyObj: TReqClientTargetingMessage = await body.value;
  const dataObj: TReqOnesignalTargetingMessage = {
    ...dataBodyObj,
    ...dataLocalsObj,
  };

  // This to check type of request client to stricted
  const result = StrictTReqClientTG.safeParse(dataBodyObj);
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
  const msgJson: JSON = await targetingMessageResponse(dataObj);
  const res: TRes = {
    status: 1,
    successMessage: STATUS_TEXT[Status.Created],
    data: {
      msg: "Message successfully pushed",
      logger: JSON.stringify(msgJson),
    },
  };
  context.response.body = res;
  context.response.status = Status.Created;
  console.log(`--> ${TAG}: has been ended`);
  return;
};
