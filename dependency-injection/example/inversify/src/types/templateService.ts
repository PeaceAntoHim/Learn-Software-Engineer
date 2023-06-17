import { config } from "../config/config"

export const TService = {
   IBankService: Symbol.for("IBankService"),
   IService: Symbol.for("IService")
}

export type keyServices = keyof typeof config