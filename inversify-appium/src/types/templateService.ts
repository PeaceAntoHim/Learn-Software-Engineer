import { GithubService } from "../services/GithubService"
import { TabularService } from "../services/TabularService"
import { configService } from "../configs/configService"
import { BCAService } from "../services/BCAService"
import { BRIService } from "../services/BRIService"



export type TconfigService = {
   Github: Record<string, GithubService>,
   Tabular: Record<string, TabularService>,
   BCA: Record<string, BCAService>,
   BRI: Record<string, BRIService>
}

export type keyServices = keyof typeof configService