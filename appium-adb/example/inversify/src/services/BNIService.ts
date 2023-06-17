import { injectable } from "inversify";
import "reflect-metadata";
import { BNI } from "../core/BNI/BNI.js";
import { IBankService } from "../interface/interface.js";
@injectable()
class BNIService implements IBankService {
   private _bankService: BNI

   constructor() {
      this._bankService = new BNI()
   }

   getBankLogic() {
      // return "Logic of BNI"
      return this._bankService
   }
   
   
}
// new BNIService().getBankLogic()
export {BNIService}