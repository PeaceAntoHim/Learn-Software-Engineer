import { Browser, remote } from "webdriverio"
import {AutomatedCapabilities} from "../appium/AutomatedCapabilities"
import { TabularComponent } from "../components/TabularComponent"
import { IAppService } from "../interfaces/IAppService"
import { configApp } from "../configs/configApp"
import { Utils } from "../libs/Utils"
import { AdbDevice } from "../android/AdbDevice"


export class TabularService implements IAppService {
   private _appPackage: string
   private _appActivity: string
   private _adbDevice: AdbDevice
 
   constructor() {
      this._appPackage = configApp.application.tabular.appPackage
      this._appActivity = configApp.application.tabular.appActivity
      this._adbDevice = new AdbDevice()
   }

   async launchAutomated() {
    this._adbDevice.runShellTabular()
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities()
      const driver: Browser = await remote(remoteOptions)
      const utils = new Utils(driver)
    
      await this.loginAndSignUp(utils)
      await this.navigateToBusinessTemplate(utils)
      const data = await this.getTextFromBusinessTemplate(utils)
      console.log('--> Data ' + data)
      await this.goBack(utils)
      await this.openHamburgerMenu(utils)
      await this.openSettings(utils)
      await this.logout(utils)
      await this.acceptedLogout(utils)
    }
    
    async loginAndSignUp(utils: Utils) {
      await utils.tapElement(TabularComponent.loginComponent.allow)
      await utils.tapElement(TabularComponent.loginComponent.language)
      await utils.tapElement(TabularComponent.loginComponent.getStarted)
      await utils.tapElement(TabularComponent.loginComponent.signUp)
      await utils.tapElement(TabularComponent.loginComponent.account)
      await utils.tapElement(TabularComponent.loginComponent.openApp)
    }
    
    async navigateToBusinessTemplate(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.bussinessTemplate)
    }
    
    async getTextFromBusinessTemplate(utils: Utils) {
      return await utils.getElements(TabularComponent.homeComponent.getText)
    }
    
    async goBack(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.goBack)
    }
    
    async openHamburgerMenu(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.humberger)
    }

    async openSettings(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.settings)
    }

    async logout(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.logout)
    }

    async acceptedLogout(utils: Utils) {
      await utils.tapElement(TabularComponent.homeComponent.acceptLogout)
    }
}