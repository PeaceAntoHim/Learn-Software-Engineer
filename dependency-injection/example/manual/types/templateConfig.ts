import { BCAService } from "../libs/BCA"
import { BNIService } from "../libs/BNI"
import { BRIService } from "../libs/BRI"
import { SEAService } from "../libs/SEA"

export type Tconfig = {
   BCA: Record<string, BCAService>,
   BNI: Record<string, BNIService>,
   BRI: Record<string, BRIService>,
   SEA: Record<string, SEAService>
}