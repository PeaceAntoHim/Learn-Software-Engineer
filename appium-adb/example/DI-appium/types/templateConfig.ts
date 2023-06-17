import { GithubService } from "../service/Github"
import { TabularService } from "../service/Tabular"


export type Tconfig = {
   Github: Record<string, GithubService>,
   Tabular: Record<string, TabularService>
}