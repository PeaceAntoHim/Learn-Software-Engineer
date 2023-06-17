
import { injectable } from "inversify"
import "reflect-metadata";
import { IBankService } from "../interface/interface.js";
import { BCA } from "../core/BCA/BCA.js";

@injectable()
class BCAService implements IBankService {
   private _bankService: BCA

   constructor() {
      this._bankService = new BCA()
   }

   getBankLogic() {
      return this._bankService
   }
   
}

export {BCAService}