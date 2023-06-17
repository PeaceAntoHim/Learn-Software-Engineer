import { Response } from "https://deno.land/x/oak@v11.1.0/response.ts";
import { templateRes } from "../interface/templateResponse.ts";
import { Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";

export default ({ response }: {response: Response}): void => {
	// response.status = 404;
	// response.headers['Content-Type'] = 'application/json'
	// response.body = { msg: "Not Found" };
	const res: templateRes = {
		status: -2,
		errMessage: "Bad Request",
		data: {msg: "page not found"}
	}
	response.body = res;
	response.type = "json";
	response.status = Status.NotFound
};