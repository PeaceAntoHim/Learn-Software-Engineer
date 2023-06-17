import { CustomError } from "../class/CustomError.ts";
import { Status, STATUS_TEXT } from "../helpers/deps.ts";
import {
  deviceUnsubscribedResponse,
  listAllDeviceResponse,
} from "../services/oneSignalService.ts";
import { TDeviceUnsubscribed } from "../types/templateCustomMiddleware.ts";
import { TDataDeleteUnsubscribed } from "../types/templateDataDeleteUnsubcribed.ts";
import { TTemplateDeviceUnsubscribed } from "../types/templateDeviceUnsubscribed.ts";
import { TRes, TResListViewDevices } from "../types/templateResponse.ts";

export const deleteDeviceUnsubscribed: TDeviceUnsubscribed = async (
  context,
) => {
  const TAG = "deleteDeviceUnsubscribed";
  console.log(`--> ${TAG}: has been called with`);
  const dataLocalObj: TTemplateDeviceUnsubscribed = context.state.client;
  // This to got response list all devices players from onesignal service
  const resListAllDevice: TResListViewDevices = await listAllDeviceResponse(
    dataLocalObj,
  );
  console.log(`--> ${TAG}: ${resListAllDevice}`);
  // This to chacked are all unsubscribed devices unsubscribed
  if (
    resListAllDevice && resListAllDevice.players &&
    resListAllDevice.players.length == 0
  ) {
    throw new CustomError(
      -2,
      {
        msg: "No devices was created",
        logger: STATUS_TEXT[Status.NoContent],
      },
      Status.NoContent,
    );
  }
  // This to filter all devices unsubscribed
  const listAllDeviceUnsubscribed = resListAllDevice.players.filter((
    device: { invalid_identifier: boolean },
  ) => device.invalid_identifier === true);
  // This to got response deleted unsubscribed devices from onesignal
  const _resDeleteUnsubscribed: TDataDeleteUnsubscribed[] =
    await deviceUnsubscribedResponse({
      ...{ players: listAllDeviceUnsubscribed },
      ...dataLocalObj,
    });
  console.log(`--> ${TAG}: ${listAllDeviceUnsubscribed}`);
  // This should be happened when all required was be completed
  const res: TRes = {
    status: 1,
    successMessage: STATUS_TEXT[Status.Created],
    data: {
      msg: "Deleted unsubscribed device successfully",
      logger: _resDeleteUnsubscribed,
    },
  };
  console.log(_resDeleteUnsubscribed);
  context.response.body = res;
  context.response.status = Status.Accepted;
  console.log(`--> ${TAG}: has been called`);
  return;
};
