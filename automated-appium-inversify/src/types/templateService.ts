import { configService } from "../configs/configService"
import { BCAService } from "../services/BCAService"
import { BNIService } from "../services/BNIService"
import { BRIService } from "../services/BRIService"



export type TconfigService = {
   BCA: Record<string, BCAService>,
   BRI: Record<string, BRIService>,
   BNI: Record<string, BNIService>,
}

export type keyServices = keyof typeof configService