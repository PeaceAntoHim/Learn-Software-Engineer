import { inject, injectable } from "inversify";
import { IAppService, IService } from "../interface/interface";
import "reflect-metadata";
import { Tservice } from "../types/templateService";


@injectable()
export class SelectServiceController implements IService{
   private _serviceApp: IAppService

   constructor(
      @inject(Tservice.IAppService) serviceApp: IAppService
   ) {
      this._serviceApp = serviceApp;
   }

   async getServiceTest() {
      console.log("test")
      console.log(await this._serviceApp.launchTest())
       await this._serviceApp.launchTest()
   }
}