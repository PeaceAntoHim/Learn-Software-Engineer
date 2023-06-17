
import { RemoteOptions, remote } from "webdriverio";
import { TAppiumServer } from "../types/templateService.js";
// /**
//  * @typedef {import("webdriverio").RemoteOptions} RemoteOptions
//  * @typedef {import("../libs/TypeDef").AppiumServer} AppiumServer
//  */
class AppiumTools {

    /**
     * 
     * @param {{port: Number, udid: String}}  
     * @returns 
     */
    buildAppiumOpts({ port, udid }: { port: number; udid: string; }) {
        /** @type {RemoteOptions} */
        let opts: RemoteOptions = {
            path: "/wd/hub",
            port: port,
            logLevel: "warn",
            capabilities: {
               platformName: "Android",
               deviceName: "V2050",
               automationName: "UiAutomator2",
               udid: udid,
               // "appium:appPackage": "id.co.bri.brimo",
               // "appium:appActivity": ".ui.activities.SplashScreenActivity",
               noReset: true,
               dontStopAppOnReset: true,
               autoLaunch: false,
               skipLogcatCapture: true,
            //    "appium:clearDeviceLogsOnStart": true
            //    clearDeviceLogsOnStart: true
            // "appium:clearSystemFiles": true
            }
        }
        return opts

    }

    /**
     * 
     * @param {{server: TAppiumServer }}  
     */
    async createAppiumClient({ server }: { server: TAppiumServer; }) {
        let opts = this.buildAppiumOpts({ port: server.port, udid: server.deviceId })
        let client = await remote(opts)
        return client
    }
}

let appiumTools = new AppiumTools()

export { appiumTools }