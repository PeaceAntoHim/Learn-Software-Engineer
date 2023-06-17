import { Status } from "../helpers/deps.ts";
import { CustomError } from "../class/CustomError.ts";

export const _pageNotFound = () => {
  const TAG = "_pageNotFound";
  console.log(`--> ${TAG}: has been called`);
  throw new CustomError(-4, { msg: "Page not found" }, Status.NotFound);
};
