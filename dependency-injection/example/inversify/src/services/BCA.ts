
import { injectable } from "inversify"
import "reflect-metadata";
import { IBankService } from "../interface/interface"

@injectable()
class BCAService implements IBankService {
   private _componentBank = {
      bankName: "BCAService",
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
      return "Logic of BCA"
   }
   
}

export {BCAService}