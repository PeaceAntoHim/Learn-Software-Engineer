import { Browser, remote } from "webdriverio";
import { AdbDevice } from "../android/AdbDevice";
import { AutomatedCapabilities } from "../appium/AutomatedCapabilities";
import { configApp } from "../configs/configApp";
import { Utils } from '../libs/Utils'
import { BRIComponent } from "../components/BRIComponent";

export class BRIService {
   private _adbDevice: AdbDevice
   private _usernameBRI: string
   private _passwordBRI: string

   constructor() {
      this._usernameBRI =  configApp.application.BRI.credential.username
      this._passwordBRI = configApp.application.BRI.credential.password 
      this._adbDevice = new AdbDevice();
   }
   
   async launchAutomated() {
      this._adbDevice.runShellBRI()
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities();
       const driver: Browser = await remote(remoteOptions);
       const utils = new Utils(driver);
     
       await this.login(utils, driver);
   }

   async login(utils: Utils, driver: Browser){
      // console.log(this._usernameBRI)
      await utils.tapElement(BRIComponent.loginComponent.login)
      // Set value to username and password
      await utils.setValueOfElement(BRIComponent.loginComponent.username,
      this._usernameBRI);
      await utils.setValueOfElement(BRIComponent.loginComponent.password,
      this._passwordBRI);
      await utils.tapElement(BRIComponent.loginComponent.login)
      // await utils.delay(1000)
      // Dashboard
      await utils.tapElement(BRIComponent.homeComponent.notification)
      await driver.touchAction([
         { action: "longPress", x: 1052, y: 1567 },
         { action: "moveTo", x: 1041, y: 489 },
         "release",
       ]);
       const listTitleNotification = await utils.getElements(BRIComponent.homeComponent.titleNotification)
       const listMessageNotification = await utils.getElements(BRIComponent.homeComponent.messageNotification)
       const listTimeNotification = await utils.getElements(BRIComponent.homeComponent.messageTime)

       const data = {
         listTitleNotification: listTitleNotification,
         listMessageNotification: listMessageNotification, 
         listTimeNotification: listTimeNotification
       }
       console.log(data)

       await utils.tapElement(BRIComponent.homeComponent.back)
       await utils.tapElement(BRIComponent.homeComponent.akun)
       await driver.touchAction([
         { action: "longPress", x: 1052, y: 1567 },
         { action: "moveTo", x: 1041, y: 489 },
         "release",
       ]);
       await utils.tapElement(BRIComponent.homeComponent.logOut)
       await utils.tapElement(BRIComponent.homeComponent.confirmButton)
   }

 
}