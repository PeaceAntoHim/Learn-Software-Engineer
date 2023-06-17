import { BCAService } from "../services/BCAService.js";
import { BNIService } from "../services/BNIService.js";
import { BRIService } from "../services/BRIService.js";
import { MDRService } from "../services/MDRService.js";


export type Tconfig = {
   BCA: Record<string, BCAService>,
   BNI: Record<string, BNIService>,
   BRI: Record<string, BRIService>,
   MDR: Record<string, MDRService>
}