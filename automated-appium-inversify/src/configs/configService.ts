import { BCAService } from "../services/BCAService";
import { BNIService } from "../services/BNIService";
import { BRIService } from "../services/BRIService";

import { TconfigService } from "../types/templateService";


export const configService: TconfigService = {
   BCA: {
      service: new BCAService()
   },
   BRI: {
      service: new BRIService()
   },
   BNI: {
      service: new BNIService()
   }
}
