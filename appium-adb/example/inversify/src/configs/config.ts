import { BCAService } from "../services/BCAService.js";
import { BNIService } from "../services/BNIService.js";
import { BRIService } from "../services/BRIService.js";
import { MDRService } from "../services/MDRService.js";
import { Tconfig } from "../types/templateBankConfig.js";

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
   MDR: {
      service: new MDRService()
   }
}

// config.BRI.service.getBankLogic()