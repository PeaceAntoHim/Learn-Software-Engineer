import { Browser, remote } from "webdriverio"
import { AdbDevice } from "../android/AdbDevice"
import { AutomatedCapabilities } from "../appium/AutomatedCapabilities"
import { configApp } from "../configs/configApp"
import { Utils } from '../libs/Utils'
import { BCAComponent } from "../components/BCAComponent"

export class BCAService {
   private _adbDevice: AdbDevice
   private _password: string
   private _pin: string
 
   constructor() {
      this._password = configApp.application.BCA.credential.password
      this._pin = configApp.application.BCA.credential.pin
      this._adbDevice = new AdbDevice();
   }

   async launchAutomated() {
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities();
      const driver: Browser = await remote(remoteOptions);
      const utils = new Utils(driver);
    
      await this.login(utils, driver);
     
    }

    async login(utils: Utils, driver: Browser){
      this._adbDevice.runShellBCA();
      await utils.tapElement(BCAComponent.loginComponent.mBca);
      await utils.setValueOfElement(
        BCAComponent.loginComponent.input,
        this._password
      );
      await utils.tapElement(BCAComponent.loginComponent.login);
    
      // dashboard
      await utils.getElement(BCAComponent.homeComponent.greenIndicator);
      await utils.tapElement(BCAComponent.homeComponent.mInfo)
      await utils.tapElement(BCAComponent.homeComponent.mutasi);
      await utils.tapElement(BCAComponent.homeComponent.startDate);
      // await utils.tapElement(BCAComponents.homeComponent.previous);
      await utils.tapElement(BCAComponent.homeComponent.date);
      await utils.tapElement(BCAComponent.homeComponent.ok);
      await utils.tapElement(BCAComponent.homeComponent.send);
      await utils.setValueOfElement(
         BCAComponent.mutationComponent.INPUT_TEXT,
         this._pin
      )
      await utils.tapElement(BCAComponent.mutationComponent.BUTTON_OK)
      await driver.touchAction([
         { action: "longPress", x: 1052, y: 1567 },
         { action: "moveTo", x: 1041, y: 489 },
         "release",
       ]);
       const listMutation = await utils.getElements(BCAComponent.homeComponent.textView);
       console.log(JSON.stringify(listMutation));
    }
}