import { config } from "./configs/config.js";
import { SelectService } from "./controller/SelectServiceController.js";
import { InputService } from "./libs/InputService.js";
import { keyServices } from "./types/templateService.js";
import { sqlDb } from "./SqlDb.js";
import { AdbService } from "./android/AdbService.js";
import { DeviceManager } from "./android/DeviceManager.js";
import { AppiumManager } from "../src/appium/AppiumManager.js";

// @injectable()
class Main {
   private _selectService: Promise<string>
   private _getServiceBankComponents: Record<string, string>
   private _getServiceBankLogic
   private _nameService: string
   adbService: AdbService;
   deviceManager: DeviceManager;
   appiumManager: AppiumManager;


   constructor() {
      this.run()
      .catch((err: Error) => {
         console.warn("Initialization system error: " + err)
      })
   }


   async run() {
      await this.initDb(); 
      await this.initAdbService();
      await this.initAppiumManager();
      await this.initDeviceManager();
      await this.getInput();
   }
   
   async getInput() {
      this._selectService = new InputService().getInputServiceFromCommandLine() 
      this.initClientService()
   }

   async initDb(){
      await sqlDb.connectDb()
      console.info("initDb")

  }

  async initAdbService() {
      console.info("initAdbService")
      this.adbService = new AdbService();
      await this.adbService.initClient();
  }

  async initDeviceManager() {
      console.info("initDeviceManager")
      this.deviceManager = new DeviceManager({ adbService: this.adbService , appiumManager: this.appiumManager});
      await this.deviceManager.syncDevices()
          .catch((err: Error) => {
              console.warn("Sync Connected Devices has problem try check permission", err)
          })
  }

  async initAppiumManager() {
      this.appiumManager = new AppiumManager();
      await this.appiumManager.spawnAllServer();

  }

   async initClientService() {
      this._nameService  = await this._selectService
      this._getServiceBankLogic =
       new SelectService(
         config[this._nameService as keyServices].service,
         // config["BCA"].service,
         this.deviceManager,
         this.appiumManager
         ).getServiceBankLogic()
      this.AppiumTest()
   }

   private AppiumTest() {
      console.log(`Get Input From Cmd: ${this._nameService}`)
      console.log('Get Service Bank Component: ' + JSON.stringify(this._getServiceBankComponents))
      console.log(`Get Service Bank Logic: ${this._getServiceBankLogic}`)
   }
   
}

new Main()

// export {Main}