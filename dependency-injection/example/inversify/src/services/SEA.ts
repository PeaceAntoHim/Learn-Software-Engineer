import { IBankService } from "../interface/interface";
import { injectable } from "inversify";
import "reflect-metadata";
@injectable()
class SEAService implements IBankService {
   private _componentBank = {
      bankName: "SEAService",
      username: "Username",
      password: "Password",
      btnLogin: "btnLogin",
      homePage: "homePage",
      mutasi: "mutasi",
   }

   components(): Record<string, string> {
      return this._componentBank
   }
   logic(): string {
      return "Logic of SEA"
   }
   
}

export {SEAService}