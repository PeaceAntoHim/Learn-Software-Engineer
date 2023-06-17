import { BCAService } from "../services/BCAService";
import { BRIService } from "../services/BRIService";
import { GithubService } from "../services/GithubService";
import { TabularService } from "../services/TabularService";
import { TconfigService } from "../types/templateService";


export const configService: TconfigService = {
   Github: {
      service:  new GithubService()
   },
   Tabular: {
      service: new TabularService()
   },
   BCA: {
      service: new BCAService()
   },
   BRI: {
      service: new BRIService()
   }
}
