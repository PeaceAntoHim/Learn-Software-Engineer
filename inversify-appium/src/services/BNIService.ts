import { Browser, remote } from "webdriverio";
import { AdbDevice } from "../android/AdbDevice";
import { AutomatedCapabilities } from "../appium/AutomatedCapabilities";
import { Utils } from "../libs/Utils";
import { configApp } from "../configs/configApp";
import { BNIComponent } from "../components/BNIComponent";

export class BNIService {
   private _adbDevice: AdbDevice
   private _userID: string
   private _MPIN: string


   constructor() {
      this._userID = configApp.application.BNI.credential.userID
      this._MPIN = configApp.application.BNI.credential.MPIN
      this._adbDevice = new AdbDevice()
   }

   async launchAutomated() {
      this._adbDevice.runShellBNI()
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities();
       const driver: Browser = await remote(remoteOptions);
       const utils = new Utils(driver);
       await this._adbDevice.runShellBNI()
       await this._login(utils, driver)
       await this._mutation(utils)
   }

   private async _login(utils: Utils, driver: Browser) {
      await utils.tapElement(BNIComponent.welcomePage.LOGIN_BTN)
      await utils.setValueOfElement(
         BNIComponent.loginPage.USERID_FIELD,
         this._userID
      )
      await utils.setValueOfElement(
         BNIComponent.loginPage.MPIN_FIELD,
         this._MPIN
      )
      await utils.tapElement(
         BNIComponent.loginPage.LOGIN_BTN
      )
      await utils.tapElement(
         BNIComponent.alert.OK_BTN
      )
      await utils.tapElement(
         BNIComponent.alert.keepLaterUserId
      )
   }

   private async _mutation(utils: Utils) {
      await utils.tapElement(
         BNIComponent.dashboardPage.RIWAYAT_ICON
      )

      await utils.tapElement(
         BNIComponent.riwayatPage.PERIOD_MONTHLY
      )

      await utils.tapElement(
         BNIComponent.riwayatPage.NEXT_BUTTON
      )
   }
}