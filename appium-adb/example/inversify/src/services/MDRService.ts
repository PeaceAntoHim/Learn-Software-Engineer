import { injectable } from "inversify";
import "reflect-metadata";
import { Mandiri } from "../core/MDR/Mandiri.js";
import { IBankService } from "../interface/interface.js";
@injectable()
class MDRService implements IBankService {
   private _bankService: Mandiri

   constructor() {
      this._bankService = new Mandiri();
   }

   getBankLogic() {
      return this._bankService
   }
}

export {MDRService}