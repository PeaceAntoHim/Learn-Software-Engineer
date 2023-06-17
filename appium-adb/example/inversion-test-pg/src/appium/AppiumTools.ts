
import { remote } from "webdriverio";
/**
 * @typedef {import("webdriverio").RemoteOptions} RemoteOptions
 * @typedef {import("../libs/TypeDef").AppiumServer} AppiumServer
 */
class AppiumTools {

    /**
     * 
     * @param {{port: Number, udid: String}}  
     * @returns 
     */
    buildAppiumOpts({ port, udid }: {port: Number, udid: String}) {
        /** @type {RemoteOptions} */
        let opts = {
            path: "/wd/hub",
            port: port,
            logLevel: "warn",
            capabilities: {
                platformName: "Android",
                "appium:deviceName": "Samsung Galaxy A11",
                "appium:automationName": "UiAutomator2",
                "appium:udid": udid,
                // "appium:appPackage": "id.co.bri.brimo",
                // "appium:appActivity": ".ui.activities.SplashScreenActivity",
                "appium:noReset": true,
                "appium:dontStopAppOnReset": true,
                "appium:autoLaunch": false,
                "appium:skipLogcatCapture": true,
                "appium:clearDeviceLogsOnStart": true
            }
        }
        return opts

    }

    /**
     * 
     * @param {{server: AppiumServer }}  
     */
    async createAppiumClient({ server } : {server: AppiumServer}) {
        let opts = this.buildAppiumOpts({ port: server.port, udid: server.deviceId })
        let client = await remote(opts)
        return client
    }
}

let appiumTools = new AppiumTools()

export { appiumTools }