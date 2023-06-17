import { Input } from "../src/libs/Input";
import { SelectServiceController } from "../src/controllers/SelectServiceController";
import { keyServices } from "../src/types/templateService";
import { configService } from "../src/configs/configService";



export class App {
   private _getServiceName: Promise<string>

   constructor() {
      this._getServiceName = new Input().getServiceName()
   }
   
   async initClientservice() {
      const nameService = await this._getServiceName 
      console.log(nameService)
      new SelectServiceController(configService[nameService as keyServices].service).startAutomatedService() 
   }
}
