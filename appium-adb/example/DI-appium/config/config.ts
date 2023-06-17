import { GithubService } from "../service/Github";
import { TabularService } from "../service/Tabular";
import { Tconfig } from "../types/templateConfig";


export const config= {
   Github: {
      service:  new GithubService()
   },
   Tabular: {
      service: new TabularService()
   }

}