import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBankService, IService } from "../interface/interface";
import { TService } from "../types/templateService";


@injectable()
export class SelectService implements IService {
   private _serviceBank: IBankService

   constructor(
      @inject(TService.IBankService) serviceBank: IBankService
   ) {
      this._serviceBank = serviceBank
   }

   getServiceBankComponents(): Record<string, string> {
      return this._serviceBank.components()
   }

   getServiceBankLogic(): string {
      return this._serviceBank.logic()
   }
}
