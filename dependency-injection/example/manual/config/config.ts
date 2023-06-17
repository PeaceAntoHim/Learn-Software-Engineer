import { BCAService } from "../libs/BCA";
import { BNIService } from "../libs/BNI";
import { BRIService } from "../libs/BRI";
import { SEAService } from "../libs/SEA";
import { Tconfig } from "../types/templateConfig";

export const config: Tconfig = {
   "BCA": {
      service: new BCAService()
   },
   "BNI": {
      service: new BNIService()
   },
   "BRI": {
      service: new BRIService()
   },
   "SEA": {
      service: new SEAService()
   }
}

