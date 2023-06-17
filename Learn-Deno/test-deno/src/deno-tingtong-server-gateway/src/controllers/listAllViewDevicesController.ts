import { CustomError } from "../class/CustomError.ts";
import { Status, STATUS_TEXT } from "../helpers/deps.ts";
import { formatDate } from "../lib/formatDate.ts";
import { listAllDeviceResponse } from "../services/oneSignalService.ts";
import { TListViewDevicesMiddleware } from "../types/templateCustomMiddleware.ts";
import { TTemplateListViewDevices } from "../types/templateListViewDevices.ts";
import { TRes, TResListViewDevices } from "../types/templateResponse.ts";

const TAG = "getAllListDevices";

export const getAllListViewDevices: TListViewDevicesMiddleware = async (
  context,
) => {
  console.log(`${TAG}: has been called `);
  const dataLocalObj: TTemplateListViewDevices = context.state.client;
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
  // This to formated date from onsignal
  const listAllDevice: TResListViewDevices = formatDate(resListAllDevice);
  // This should be happened when all required was be completed
  const res: TRes = {
    status: 1,
    successMessage: STATUS_TEXT[Status.Accepted],
    data: {
      msg: "Got all list view devices successfully",
      list_all: listAllDevice,
    },
  };
  console.log(listAllDevice);
  context.response.body = res;
  context.response.status = Status.Accepted;
  console.log(`--> ${TAG}: has been called`);

  return;
};
