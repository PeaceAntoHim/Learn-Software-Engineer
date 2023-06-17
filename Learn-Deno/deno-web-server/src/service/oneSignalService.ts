import { APP_ID, REST_API_KEY, ONE_SIGNAL_API_GATEWAY } from "../../config.ts";
import { templateReq } from "../interface/templateRequest.ts";

export const allSegmentDeviceResponse = async (dataStr: string): Promise<JSON> => {
   const objData: templateReq = JSON.parse(dataStr);
   console.log(`${JSON.stringify(objData.data)}`);

   const payload = {
      app_id: APP_ID,
      included_segments: objData?.included_segments || ["Subscribed Users"],
      data: objData.data,
      contents: objData.contents
   };

   const res: Response = await fetch(ONE_SIGNAL_API_GATEWAY,{
      method: "POST",
      headers: {
         "Content-Type": "application/json; charset=utf-8",
         "Authorization": "Basic " + REST_API_KEY,
      },
      body: JSON.stringify(payload)
   });

   return res.json();
}

export const baseExternalIdDevice = async (dataStr: string): Promise<JSON> => {
   const objData: templateReq = JSON.parse(dataStr);
   console.log(`${JSON.stringify(objData.data)}`);

   const payload = {
      app_id: APP_ID,
      include_external_user_ids: objData.include_external_user_ids,
      channel_for_external_user_ids: "push",
      data: objData.data,
      android_sound: objData.android_sound || "test",
      contents: objData.contents
   };

   const res: Response = await fetch(ONE_SIGNAL_API_GATEWAY,{
      method: "POST",
      headers: {
         "Content-Type": "application/json; charset=utf-8",
         "Authorization": "Basic " + REST_API_KEY,
      },
      body: JSON.stringify(payload)
   });

   return res.json();
}



