import { IBankService } from "../interface/interface";
import { injectable } from "inversify";
import "reflect-metadata";
@injectable()
class BRIService implements IBankService {
   private _componentBank = {
      bankName: "BRIService",
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
      return "Logic of BRI"
   }
}

export {BRIService}