import { injectable } from "inversify";
import "reflect-metadata";
import { IBankService } from "../interface/interface.js";
import { BRI } from "../core/BRI/BRI.js";
@injectable()
class BRIService implements IBankService {
   private _bankService: BRI;
   
   constructor() {
      this._bankService = new BRI();
   }
   
   getBankLogic() {
      // return "Logic of BRI"
      return this._bankService
   }
}

export {BRIService}

// new BRIService().getBankLogic()