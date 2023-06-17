import { BCAService } from "../services/BCA"
import { BNIService } from "../services/BNI"
import { BRIService } from "../services/BRI"
import { SEAService } from "../services/SEA"

export type Tconfig = {
   BCA: Record<string, BCAService>,
   BNI: Record<string, BNIService>,
   BRI: Record<string, BRIService>,
   SEA: Record<string, SEAService>
}