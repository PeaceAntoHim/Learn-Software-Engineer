import { injectable } from "inversify";
import { Input } from "../libs/getService";
import { SelectServiceController } from "../controller/SelectServiceContoller";
import { keyServices } from "../types/templateService";
import { config } from "../config/config";



// @injectable()
export class Main {
   
   private _selectService: Promise<string>
   // private _getServiceTest: Record<string, string>
   private _nameService: string;

   constructor() {
      this._selectService = new Input().getInputFromCommandLine()
   }

   async initClientservice() {
      this._nameService = await this._selectService 
      console.log(this._nameService)
      // config['Github'].service.launchTest()
      new SelectServiceController(config[this._nameService as keyServices].service).getServiceTest() 
   }

}