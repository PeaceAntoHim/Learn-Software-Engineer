import { Response } from "https://deno.land/x/oak@v11.1.0/response.ts";
import { templateRes } from "../interface/templateResponse.ts";
import { Status, isHttpError } from "https://deno.land/x/oak@v11.1.0/mod.ts";

export default async ({ response }: {response: Response}, nextFn: () => Promise<unknown>): Promise<void> => {
	try {
	 await nextFn();
	} catch (err) {
		if(isHttpError(err)) {
			const res: templateRes = {
				status: -5,
				errMessage: "Internal Server Error",
				data: {msg: err.message},
			}
			response.body = res;
			response.type = "json";
			response.status = Status.InternalServerError;
		} else {
			const res: templateRes = {
				status: -4,
				errMessage: "Bad request",
				data: {msg: err.message},
			}
			response.body = res;
			response.type = "json";
			response.status = Status.BadRequest;
		
		}
   }
}