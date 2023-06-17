import {allSegmentDeviceResponse} from "../service/oneSignalService.ts";
import { Response } from "https://deno.land/x/oak@v11.1.0/response.ts";
import { Request } from "https://deno.land/x/oak@v11.1.0/request.ts";
import { templateRes } from "../interface/templateResponse.ts";
import { Status } from "https://deno.land/x/oak@v11.1.0/mod.ts";

export default async ({request, response}: { request: Request; response: Response }):Promise<void> => {
   const body  = request.body();
   const dataStr: string = await body.value;

   // If the body doesn't contain any data will return an error message
   if (!request.hasBody) {
      const res: templateRes = {
         status: -1,
         errMessage: "Bad Request body null",
         data: {msg: "Data is required"}
      }
      response.body = res
      response.type = "json";
      response.status = Status.BadRequest;
      return;
   }

   // If dataStr just got empty string from request body then will return error message
   if(dataStr == "") {
      const res: templateRes = {
         status: -2,
         errMessage: "Data is empty string",
         data: {msg: "Data is required"},
      }
      response.body = res;
      response.type = "json";
      response.status = Status.BadRequest;
      return;
   }
   
   // If message successfully being pushed to the onesignal server
   const msgJson: JSON = await allSegmentDeviceResponse( dataStr );
   const res: templateRes = {
      status: 0,
      data: {
         msg: "Message successfully pushed", logger: JSON.stringify(msgJson)
      }
   }
   console.log(msgJson);
   response.body = res;
   response.type = "json";
   response.status = Status.Created;
   return;
};