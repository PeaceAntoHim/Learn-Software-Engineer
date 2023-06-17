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
   private _driver!: Browser
   private _utils!: Utils
 
   constructor() {
      this._password = configApp.application.BCA.credential.password
      this._pin = configApp.application.BCA.credential.pin
      this._adbDevice = new AdbDevice();
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities();
      (async () => {
         this._driver = await remote(remoteOptions)
         this._utils = new Utils(this._driver);
      })().catch((err) => {
         return console.error(err);
      })
   }

   async processMutation() {
      await this._login();
      await this._mutation();
      await this._logout();
   }

    private async _login(): Promise<void> {
      this._adbDevice.runShellBCA();
      await this._utils.tapElement(BCAComponent.loginComponent.mBca);
      await this._utils.setValueOfElement(
         BCAComponent.loginComponent.input,
         this._password
      );
      await this._utils.tapElement(BCAComponent.loginComponent.login);
   }
    
   private async _mutation(): Promise<void> {
      // dashboard
      await this._utils.getElement(BCAComponent.homeComponent.greenIndicator);
      await this._utils.tapElement(BCAComponent.homeComponent.mInfo)
      await this._utils.tapElement(BCAComponent.homeComponent.mutasi);
      await this._utils.tapElement(BCAComponent.homeComponent.startDate);
      // await this._utils.tapElement(BCAComponents.homeComponent.previous);
      await this._utils.tapElement(BCAComponent.homeComponent.date);
      await this._utils.tapElement(BCAComponent.homeComponent.ok);
      await this._utils.tapElement(BCAComponent.homeComponent.send);
      await this._utils.setValueOfElement(
         BCAComponent.mutationComponent.INPUT_TEXT,
         this._pin
      )
      await this._utils.tapElement(BCAComponent.mutationComponent.BUTTON_OK)
      await this._driver.touchAction([
         { action: "longPress", x: 1052, y: 1567 },
         { action: "moveTo", x: 1041, y: 489 },
         "release",
      ]);
      const listMutation = await this._utils.getElements(BCAComponent.homeComponent.textView);
      console.log(JSON.stringify(listMutation));
   }
   
   private async _logout() {
      
   }
   
}