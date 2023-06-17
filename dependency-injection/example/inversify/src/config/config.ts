import { BCAService } from "../services/BCA";
import { BNIService } from "../services/BNI";
import { BRIService } from "../services/BRI";
import { SEAService } from "../services/SEA";
import { Tconfig } from "../types/templateBankConfig";

export const config: Tconfig = {
   BCA: {
      service: new BCAService()
   },
   BNI: {
      service: new BNIService()
   },
   BRI: {
      service: new BRIService()
   },
   SEA: {
      service: new SEAService()
   }
}

