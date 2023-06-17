import { config } from "../config/config"

export const Tservice = {
   IAppService: Symbol.for("IAppService")
}

export type keyServices = keyof typeof config