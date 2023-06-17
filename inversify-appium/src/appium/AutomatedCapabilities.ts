import { RemoteOptions } from "webdriverio";
import { configApp } from "../configs/configApp";

export class AutomatedCapabilities {
  private  webDriverPath: string = '/wd/hub';
  private  webDriverPort: number = 4723;
  private _deviceName: string

  constructor() {
    this._deviceName = configApp.deviceName;
  }
  
  appBaseCapabilities() : RemoteOptions {
    const desiredCapabilities = {
      platformName: "Android",
      "appium:deviceName": this._deviceName,
      "appium:automationName": "UiAutomator2", 
    };
    return {
      path: this.webDriverPath,
      port: this.webDriverPort,
      capabilities: desiredCapabilities
    }
 }
}
