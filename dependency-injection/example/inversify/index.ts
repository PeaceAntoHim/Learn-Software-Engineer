import { injectable } from "inversify";
import { config } from "./src/config/config";
import { SelectService } from "./src/core/selectService";
// import { IBankService, IService } from "./interface/interface"
import "reflect-metadata";
import { Input } from "./src/libs/getService";
import { keyServices } from "./src/types/templateService";

@injectable()
class Main {
   private _selectService: Promise<string>
   private _getServiceBankComponents: Record<string, string>
   private _getServiceBankLogic: string
   private _nameService: string


   constructor() {
      this._selectService= new Input().getInputFromCommandLine()
   }

   async initClientService() {
      this._nameService  = await this._selectService
      this._getServiceBankComponents = new SelectService(config[this._nameService as keyServices].service).getServiceBankComponents()
      this._getServiceBankLogic = new SelectService(config[this._nameService as keyServices].service).getServiceBankLogic()
      this.AppiumTest()
   }

   private AppiumTest() {
      console.log(`Get Input From Cmd: ${this._nameService}`)
      console.log('Get Service Bank Component: ' + JSON.stringify(this._getServiceBankComponents))
      console.log(`Get Service Bank Logic: ${this._getServiceBankLogic}`)
   }
   
}

const init = new Main()
init.initClientService()
