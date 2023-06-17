
import { tools } from '../libs/Tools.js'

import Adb from "@u4/adbkit";
const { Utils } = Adb

/**
    * @typedef {import('@u4/adbkit').Device} Device
 */

class DeviceTools {

    /**
     * @param {{device: Device, activity: String, wait: Boolean}}  
     */
    async openApplication({ device, activity, wait = true}) {
        await device.getClient().startActivity({ component: activity, wait})
    }
    /** @param {{device: Device, packageName: String}}  */
    async openAppByPackageName({ device, packageName }) {
        await this.runShell({ device, cmd: `monkey -p ${packageName} -c android.intent.category.LAUNCHER 1` })
        await tools.delay(1000)
        await this.runShell({ device, cmd: `content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0` })
    }

    /**
     * @param {{device: Device}}  
     */
    async getActivity({ device }) {
        let isSleeping = await this.isSleeping({ device })
        if (isSleeping) {
            await this.wakeUp({ device, delay: 1000 })
        }

        let output = await this.runShell({ device, cmd: "dumpsys activity activities | grep -E mResumedActivity" })
        let ary = output.split(" ")

        let activity = ary[ary.length - 2] || ""

        // SUPER SIM
        if (activity == "com.android.stk/.StkDialogActivity") {
            await this.clickBack({ device })
            activity = await this.getActivity({ device })
        }
        return activity
    }

    /**
     * @param {{device: Device, activity: String, retry: Number, interval: Number}}  
     */
    async isSameActivity({ device, activity, retry= 5, interval = 1000 }) {
        let currActivity = await this.getActivity({device})
        
        if(currActivity !== activity){
            if(retry > 0 ){
                await tools.delay(interval)
                return await this.isSameActivity({device, activity, retry: retry - 1, interval})
            }else{
                return false
            }
        }
        return true

    }
    /**
     * @param {{device: Device, activity: String, retry: Number, interval: Number}}  
     */
    async checkActivityIncludes({ device, activity, retry= 5, interval = 1000 }) {
        let currActivity = await this.getActivity({device})
        let included
        if(Array.isArray(activity)){
            included = activity.some((val) => currActivity.includes(val))
        }else{
            included = currActivity.includes(activity)
        }
        if(included === false){
            if(retry > 0 ){
                await tools.delay(interval)
                return await this.checkActivityIncludes({device, activity, retry: retry - 1, interval})
            }else{
                return false
            }
        }
        return true
    }

    /**
     * @param {{device: Device}}  
     */

    async isSleeping({ device }) {
        let txt = await this.runShell({ device, cmd: "dumpsys activity activities | grep -E isSleeping" })
        return txt.includes("true")
    }

    async wakeUp({ device, delay = 200 }) {
        await this.runShell({ device, cmd: "input keyevent KEYCODE_WAKEUP" })
        await tools.delay(delay)
    }

    async isScreenLocked({ device, delay = 100 }) {
        let txt = await this.runShell({ device, cmd: "dumpsys window | grep mDreamingLockscreen" })
        let unLocked = (txt && txt.includes("mShowingDream=false") && txt.includes("mDreamingLockscreen=false"))
        await tools.delay(delay)
        return !unLocked
    }

    /**
     * @param {{device: Device, delay: Number}}  
     */
    async clickHome({ device, delay = 500 }) {
        await this.runShell({ device, cmd: "input keyevent KEYCODE_HOME" })
        await tools.delay(delay)
    }

    /**
     * @param {{device: Device}}  
     */
    async checkKeyboardShown({ device }) {
        let msg = await this.runShell({ device, cmd: "dumpsys input_method | grep mInputShown" })
        return msg.includes("mInputShown=true")
    }

    /**
     * @param {{device: Device, count: Number, delay: Number}}  
     */
    async clickBack({ device, count = 1, delay = 1000 }) {
        for (let i = 0; i < count; i++) {
            await this.runShell({ device, cmd: "input keyevent KEYCODE_BACK" })
            await tools.delay(delay)
        }
    }
    /**
     * @param {{device: Device, delay: Number}}  
     */
    async inputEnter({device, delay = 200}){
        await this.runShell({device, cmd:  'input keyevent KEYCODE_ENTER'})
        await tools.delay(delay)
    }

    /**
     * @param {{device: Device, packageName: String}}  
     */
    async killApplication({ device, packageName }) {
        await this.runShell({ device, cmd: `am force-stop ${packageName}` })
    }
    /**
     * @param {{device: Device, cmd: String}}  
     * @return {Promise<String>}
     */
    async runShell({ device, cmd }) {
        let stream = await device.getClient().shell(cmd)
        let buffer = await Utils.readAll(stream)
        return buffer.toString().trim()
    }

    /**
     * @param {{device: Device}}  
     */
    async screencap({ device }) {
        let stream = await device.getClient().screencap()
        let buffer = await Utils.readAll(stream)
        return buffer
    }
    /**
 * 
 * @param {{device: Device, packageName: String}}
 * @returns Boolean
 */
    async checkHasPackage({ device, packageName }) {
        // return await device.getClient().isInstalled(packageName)
        let result = await this.runShell({ device, cmd: `pm list package ${packageName}` })
        return result != "" && result.includes(packageName)
    }
    /**
     * 
     * @param {{device: Device, packageName: String}} 
     */
    async allowProjectMediaByPackage({ device, packageName }) {
        await this.runShell({ device, cmd: `appops set ${packageName} PROJECT_MEDIA allow` })
    }

    /**
 * @param {{device:Device, lockPin: String}}
 */
    async openLockScreen({ device, lockPin = "0102" }) {
        let curActivity = await this.getActivity({ device })

        if (!curActivity || curActivity == "") {
            console.log("Opening Lock Screen")
            // await device.wakeUp(500)
            await deviceTools.wakeUp({device, delay: 500})
            await this.swipe({ device, start_x: 540, start_y: 1250, end_x: 540, end_y: 500, duration_ms: 1000 })
            await tools.delay(500)
            // device secure PIN
            if(await deviceTools.isScreenLocked({device})){
                console.log("Input Lock Screen")
                await this.inputText({ device, str: lockPin })
            }
            await tools.delay(500)
        }
    }
    /**
     * 
     * @param {{device: Device, start_x: Number , start_y: Number, end_x: Number, end_y: Number, duration_ms: Number}}
     */
    async swipe({ device, start_x, start_y, end_x, end_y, duration_ms = 100 }) {
        await this.runShell({ device, cmd: `input swipe ${start_x} ${start_y} ${end_x} ${end_y} ${duration_ms}` })
    }

    /**
     * 
     * @param {{device: Device, str: String, delay: Number}}  
     */
    async inputText({ device, str, delay = 200 }) {
        if (typeof str === "string") {
            str = str.replace("$", "\\$")
        }
        // run shell async
        await this.runShell({ device, cmd: `input text ${str}` })
        // wait delay
        await tools.delay(delay)
    }

    /**
     * 
     * @param {{device: Device, x: Number, y: Number}}  
     */
    async inputTap({device, x, y}) {
        // console.debug(`tap ${x}, ${y}`)
        // run shell async
        await this.runShell({ device, cmd: `input tap ${x} ${y}` })
    }

    /**
     * 
     * @param {{device: Device, activity: String}}  
     */
    async interestingWindowNumber({device, activity}) {
        let txt = await this.runShell({device, cmd: "dumpsys window displays"})
        // console.debug("txt",txt)
        // let regExp = /vietcombank.*\n.*\n.*\n.\s*mNumInterestingWindows=(.)\s/gm;
        let regExp = new RegExp(activity + ".*\n.*\n.*\n.\\s*mNumInterestingWindows=(\\d)", "gm")
        let match = regExp.exec(txt)
        // console.debug("match",match)
        let windowNumber = match ? parseInt(match[1]) : 0;
        // console.debug("windowNumber",windowNumber)
        return windowNumber
    }

    /**
        * @param {{device:Device}}
    */
    async killAppiumASettings({ device }) {
        let packageName = "io.appium.settings"
        if (await this.checkHasPackage({ device, packageName })) {
            await this.killApplication({ device, packageName })
            await tools.delay(500)
        }
        packageName = "io.appium.uiautomator2.server"
        if (await this.checkHasPackage({ device, packageName })) {
            await this.killApplication({ device, packageName })
            await tools.delay(500)
        }
        packageName = "io.appium.uiautomator2.server.test"
        if (await this.checkHasPackage({ device, packageName })) {
            await this.killApplication({ device, packageName })
            await tools.delay(500)
        }
        await tools.delay(500)
    }

    /**
        * @param {{device:Device}}
    */
    async checkTelephonyRegistry({device}) {
        let msg = await this.runShell({ device, cmd:  `dumpsys telephony.registry` })
        return msg
    }
    
    /**
        * @param {{device:Device, packageName: String}}
    */
    async checkServiceIsRunning({device, packageName}) {
        let msg = await this.runShell({device, cmd: `dumpsys activity services ${packageName}`})
        let regExp = /active/gm;
        let match = regExp.exec(msg)
        let isRunning = match ? true : false
        return isRunning
    }

    /**
     * 
     * @param {{device: Device, imageFullPath: String, imageName: String, destination: String}}  
     */
    async pushImageFile({device, imageFullPath, imageName , destination = "sdcard/Download"}){
        destination = destination.replace('sdcard', 'storage/emulated/0')
        console.debug(`push ${imageFullPath} to ${destination}/${imageName}`)
        // await this.adbService.runShell(this.id, `push ${file} ${destination}`)
        await device.getClient().push(imageFullPath, `${destination}/${imageName}`)
        await tools.delay(1500)
        await this.runShell({device, cmd: `am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///${destination}` })
    }

}

let deviceTools = new DeviceTools()
export { deviceTools }