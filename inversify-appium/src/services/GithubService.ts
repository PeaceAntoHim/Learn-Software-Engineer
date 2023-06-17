
import { AutomatedCapabilities } from '../appium/AutomatedCapabilities';
import { Browser, remote} from 'webdriverio'
import { Utils } from '../libs/Utils'
import { AdbDevice } from '../android/AdbDevice';
import { GithubComponent } from '../components/GithubComponent';
import { IAppService } from '../interfaces/IAppService';
import { configApp } from '../configs/configApp';
import { AuthyComponent } from '../components/AuthyComponent';

export class GithubService implements IAppService {
   private _appPackage: string
   private _appActivity: string
   private _adbDevice: AdbDevice
   private _username: string
   private _password: string
 
   constructor() {
      this._appPackage = configApp.application.github.appPackage
      this._appActivity = configApp.application.github.appActivity
      this._username = configApp.application.github.credential.username
      this._password = configApp.application.github.credential.password
      this._adbDevice = new AdbDevice();
   }

   async launchAutomated() {
      let key: string;
      const remoteOptions = new AutomatedCapabilities().appBaseCapabilities();
      const driver: Browser = await remote(remoteOptions);
      const utils = new Utils(driver);
    
      await this.login(utils);
      key = await this.getAuthyKey(utils);
      await this.verifyAuthyKey(utils, key);
      await this.navigateToRepo(driver, utils);
      await this.signOut(utils);
    }
    
    async login(utils: Utils) {
      await utils.tapElement(GithubComponent.loginComponent.btnLogin);
      await utils.setValueOfElement(
        GithubComponent.loginComponent.username,
        this._username
      );
      await utils.setValueOfElement(
        GithubComponent.loginComponent.password,
        this._password
      );
      await utils.tapElement(GithubComponent.loginComponent.login);
    }
    
    async getAuthyKey(utils: Utils) {
     
      this._adbDevice.runShellAuthy();
      const key = await utils.getElement(AuthyComponent.keyComponents.keyAuth);
      console.log(`--> ${key.replace(/\s/g, '')}`);
      this._adbDevice.runShellGithub();
      return key.replace(/\s/g, '');
    }
    
    async verifyAuthyKey(utils: Utils, key: string) {
      await utils.setValueOfElement(GithubComponent.loginComponent.authentication, key);
      await utils.tapElement(GithubComponent.loginComponent.btnVerify);
      await utils.tapElement(GithubComponent.homeComponent.allowButton);
      await utils.tapElement(GithubComponent.homeComponent.home);
    }
    
    async navigateToRepo(driver: Browser, utils: Utils) {
      await utils.tapElement(GithubComponent.homeComponent.organization);
      await utils.tapElement(GithubComponent.homeComponent.realtech);
      await utils.tapElement(GithubComponent.homeComponent.organizationRepo);
      const listRepo = await utils.getElements(GithubComponent.homeComponent.listRepo);
      console.log("--> " + listRepo);
      await utils.tapElement(GithubComponent.homeComponent.back);
      await utils.tapElement(GithubComponent.homeComponent.back);
      await utils.tapElement(GithubComponent.homeComponent.back);
      await utils.tapElement(GithubComponent.homeComponent.profileName);
      await utils.tapElement(GithubComponent.homeComponent.settings);
      await driver.touchAction([
        { action: "longPress", x: 1052, y: 1567 },
        { action: "moveTo", x: 1041, y: 489 },
        "release",
      ]);
    }
    
    async signOut(utils: Utils) {
      await utils.tapElement(GithubComponent.homeComponent.signOut);
      await utils.tapElement(GithubComponent.homeComponent.popUpSignOut);
    } 
}