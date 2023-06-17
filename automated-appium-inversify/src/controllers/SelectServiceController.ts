import { inject, injectable } from "inversify";
import { IAppService  } from "../interfaces/IAppService";
import { TInjectionService } from "../types/templateInjectionService";
import { IService } from "../interfaces/IService";
import "reflect-metadata";


@injectable()
export class SelectServiceController implements IService{
   private _serviceApp: IAppService

   /**
    * This constructor will inject serviceApp params use interface IAppService
    * @constructor
    * @param serviceApp
    * @requires
    * @type {IAppService}
    */
   constructor(
      @inject(TInjectionService.IAppService) serviceApp: IAppService
   ) {
      this._serviceApp = serviceApp;
   }

   /**
    * This method to start automated service of the application 
    */
   async startAutomatedService() {
      await this._serviceApp.processMutation()
   }
}