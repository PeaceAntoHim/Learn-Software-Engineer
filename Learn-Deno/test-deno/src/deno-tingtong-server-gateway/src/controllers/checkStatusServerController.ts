import { Response, Status } from "../helpers/deps.ts";

export default ({ response }: { response: Response }): void => {
  const TAG = "checkStatusServerController";
  console.log(`--> ${TAG}: has been called`);
  response.body = "OK";
  response.status = Status.OK;
  console.log(`--> ${TAG}: has been ended`);
  return;
};
