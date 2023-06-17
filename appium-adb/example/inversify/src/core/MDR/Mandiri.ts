import { deviceTools } from "../../android/DeviceTools.js";
import { appiumTools } from "../../appium/AppiumTools.js";
import { msgLogger } from "../../libs/MsgLogger.js";
import { tools } from "../../libs/Tools.js";
import { locator } from "./LocatorMandiri.js";
import { bankConfig } from "./ConfigMandiri.js";
import { transStatus } from "../../libs/TransStatus.js";
import { TAppiumServer, TDevice, TTransAccData } from "../../types/templateService.js";
import { Browser } from "webdriverio";
// import { accNoTools } from "../../configs/AccNo";
// /**
//  * @typedef {import("../../libs/TypeDef").TransAccData} TransAccData
//  * @typedef {import("../../libs/TypeDef").AppiumServer} AppiumServer
//  * @typedef {WebdriverIO.Browser} Browser
//  * @typedef {import("@u4/adbkit").Device} Device
//  */
const Status = {
    START_PROCESS: { desc: "START PROCESS", step: 1 },
    OPEN_APPLICATION: { desc: "OPEN APPLICATION", step: 2 },
    LOGIN: { desc: "LOGIN", step: 3 },
    OPEN_INTERNAL_TRANSFER: { desc: "OPEN INTERNAL TRANSFER", step: 4 },
    OPEN_INTERNAL_TRANSFER_SUCCESS: { desc: "OPEN INTERNAL TRANSFER SUCCESS", step: 5 },
    REGISTER_INTERNAL_BENEFICIARY: { desc: "REGISTER INTERNAL BENEFICIARY", step: 6 },
    INTERNAL_BENEFICIARY_ALREADY_REGISTERED: { desc: "INTERNAL BENEFICIARY ALREADY REGISTERED", step: 7 },
    REGISTER_INTERNAL_BENEFICIARY_SUCCESS: { desc: "REGISTER INTERNAL BENEFICIARY SUCCESS", step: 8 },
    TRANSFER_INTERNAL_BENEFICIARY: { desc: "INTERNAL TRANSFER", step: 9 },
    FINISHING_INTERNAL_TRANSACTION: { desc: "FINISHING TRANSACTION", step: 10 },
    TRANSFER_INTERNAL_BENEFICIARY_SUCCESS: { desc: "TRANSFER INTERNAL BENEFICIARY SUCCESS", step: 11 },
    GET_BALANCE: { desc: "GET BALANCE", step: 12 },
    GET_BALANCE_SUCCESS: { desc: "GET BALANCE SUCCESS", step: 13 },
    DELETE_BENEFICIARY: { desc: "DELETE BENEFICIARY", step: 14 },
    DELETE_BENEFICIARY_SUCCESS: { desc: "DELETE BENEFICIARY SUCCESS", step: 15 },
}

class Mandiri {
    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, server: TAppiumServer}}  
     */
    async processTransferReq({ device, transAccData, server }: { device: TDevice; transAccData: TTransAccData; server: TAppiumServer; }) {
        msgLogger.debug({ msg: `Process ${transAccData.BankCode} in ${device.id}`, transAccData, server })

        transAccData.Status = Status.START_PROCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        let appiumClient
        try {

            //check if RequestAt longer than 6 min abort
            let now = Number(new Date()) 
            let deltaDate = now - Number(new Date(transAccData.RequestAt)) 
            if (deltaDate > 360000) {
                let errMsg = `Too many queues`
                transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
                throw { message: errMsg, expected: true }
            }

            //PREVENT socket hang up by server in device ??
            await deviceTools.killAppiumASettings({ device })


            console.debug("createAppiumClient")
            appiumClient = await appiumTools.createAppiumClient({ server })

            if (await deviceTools.isSleeping({ device })) {
                await deviceTools.wakeUp({ device })
            }

            await deviceTools.clickHome({ device })

            //pancing 1st appium
            await appiumClient.getPageSource()

            await this.openApp({ device, transAccData, appiumClient })
            await this.logIn({ device, transAccData, appiumClient })
            await this.openInternalTransfer({ device, transAccData, appiumClient })
            await this.registerInternalBeneficiary({ device, transAccData, appiumClient })
            await this.transferInternalBeneficiary({ device, transAccData, appiumClient })
            await this.getBalance({ device, transAccData, appiumClient })
            await this.logOut({ device, transAccData, appiumClient })

            transStatus.saveTrans001({ transAccData })

            await deviceTools.clickHome({ device })

            //prevent cpu usage
            await deviceTools.killApplication({ device, packageName: bankConfig.packageName })
            await tools.delay(1000)

        } catch (error) {
            let errMsg = String(error.message || error)
            msgLogger.logTrans({ event: "PROCESS_TRANS_ERROR", data: { errMsg, transAccData } })

            if (!error.expected) {
                msgLogger.logTrans({ event: "ERROR_NOT_EXPECTED", data: { errMsg, transAccData } })
                if (transAccData.Status.step >= Status.TRANSFER_INTERNAL_BENEFICIARY_SUCCESS.step) {
                    transStatus.errorAfterSuccess({ transAccData, errMsg })
                } else if (transAccData.Status.step == Status.FINISHING_INTERNAL_TRANSACTION.step) {
                    transStatus.failed997({ transAccData, statusDesc: "ERROR_UNEXPECTED", errMsg })
                } else {
                    transStatus.failed998({ transAccData, errMsg })
                }
            }

            await deviceTools.killApplication({ device, packageName: bankConfig.packageName }).catch(err => {
                let errMsg = String(err.message || err)
                msgLogger.logTrans({ event: "ERROR_KILL_APP", data: { errMsg, transAccData } })
            })
            throw errMsg
        }
        finally {
            await appiumClient.deleteSession()
            .then(() => {msgLogger.logTrans({event: "DELETE_SESSION_SUCCESS", data: {transAccData}})})
            .catch(err => {
                let errMsg = String(err.message || err)
                msgLogger.logTrans({ event: "ERROR_DELETE_SESSION", data: { errMsg, transAccData } })
            })
        }

    }

    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser , retry: Number}}  
     */
    async openApp({ device, transAccData, appiumClient, retry = 2 }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; retry?: number; }) {
        transAccData.Status = Status.OPEN_APPLICATION

        if (retry <= 0) { throw "RETRY OVER" }
        if (await deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        let currActivity = await deviceTools.getActivity({ device })

        if (currActivity.split("/")[0] != bankConfig.packageName) {
            await deviceTools.openApplication({ device, activity: bankConfig.activityLaunch })
            await tools.delay(6000)
            currActivity = await deviceTools.getActivity({ device })
        }

        //check ter-log out popup
        let { isIn: isLoggedOutShown } = await this.hasLoggedOutPopup({ appiumClient, retry: 1})

        if(isLoggedOutShown === false ){
            let { isIn: inDashboard } = await this.checkIsInDashboardPage({ appiumClient })
            if (inDashboard === true) return
            
        }

        currActivity = await deviceTools.getActivity({ device })

        //check in welcome page 
        let {isIn: inWelcomePage}= await this.checkIsInWelcomePage({appiumClient})
        if (inWelcomePage === true) {
            await tools.delay(1000)
        } else {
            await deviceTools.killApplication({ device, packageName: bankConfig.packageName })
            await tools.delay(1500)
            return await this.openApp({ device, transAccData, appiumClient, retry: retry - 1 })
        }

    }

    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async logIn({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        transAccData.Status = Status.LOGIN
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn: inDashboardPage } = await this.checkIsInDashboardPage({ appiumClient })
        if (inDashboardPage === true) {
            //already loggedin
            return
        }

        let welcomeLoginBtn = await appiumClient.$(locator.WELCOME_PAGE.LOGIN_BTN)
        await welcomeLoginBtn.click()
        await tools.delay(1000)

        let { isIn: inLoginPage } = await this.checkIsInLoginPage({ appiumClient })
        if (inLoginPage === false) {
            throw { message: `${transAccData.Status.desc} Failed err: Failed Open Login Page`, expected: true }
        }

        let passwordField = await appiumClient.$(locator.LOGIN_PAGE.PASS_COL)
        let loginBtn = await appiumClient.$(locator.LOGIN_PAGE.LOGIN_BTN)

        //password
        await passwordField.click()
        await tools.delay(500)
        await passwordField.sendKeys(transAccData.AppPassword.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        await tools.delay(1000)

        //login
        await loginBtn.click()
        await tools.delay(1000)

        // check alert if wrong pass /user  
        let { isIn: wrongPass, msg } = await this.checkIsWrongPass({ appiumClient })
        if (wrongPass === true) {
            let errMsg = msg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }
        
        //TODO  handle popup

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient, retry: 5 })
        if (isIn === false) {
            let errMsg = "FAILED LOGIN"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

    }

    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async openInternalTransfer({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        
        transAccData.Status = Status.OPEN_INTERNAL_TRANSFER
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
       
        //click transfer icon
        await (await appiumClient.$$(locator.DASHBOARD_PAGE.ACTION_ICONS)[0] as WebdriverIO.Element).click() 
        await tools.delay(2000)
        
        let {isIn} = await this.checkIsInTransPage({appiumClient}) 

        if (isIn === false) {
            let errMsg = "FAILED TO TRANS PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }
        
        //click penerima baru
        await (await appiumClient.$(locator.TRANSFER_PAGE.PENERIMA_BARU_BTN)).click()
        await tools.delay(2000)
        
        let {isIn: inPenerimaBaru} = await this.checkIsInPenerimaBaruPage({appiumClient})
        if(inPenerimaBaru === false){
            let errMsg = "FAILED TO PENERIMA BARU PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        transAccData.Status = Status.OPEN_INTERNAL_TRANSFER_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

    }
    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async registerInternalBeneficiary({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        
        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })
        
        //click nomor rek
        await (await appiumClient.$(locator.PENERIMA_BARU_PAGE.NO_REK_COL)).click()
        await tools.delay(1000)
        
        //click and input rek tujuan
        let rekField = await appiumClient.$(locator.PENERIMA_BARU_PAGE.NO_REK_COL)
        await rekField.click()
        await tools.delay(1000)
        await rekField.sendKeys(transAccData.BeneficiaryAcc.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        await tools.delay(1000)

        //click lanjutkan
        await (await appiumClient.$(locator.PENERIMA_BARU_PAGE.LANJUTKAN_BTN)).click()
        await tools.delay(3000)
        
        //check error field
        let {isIn: isError, msg} = await this.checkErrorInputAccField({appiumClient})
        if(isError === true) {
            let errMsg = msg
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }
        
        //check bottom shown
        let {isIn: accountShown} = await this.checkAccountShown({appiumClient, retry: 3}) 
        if(accountShown === false){
            let errMsg = "BENEFICARY ACC NOT SHOWN"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }
       
        await tools.delay(1000)

        let accName = await (await appiumClient.$(locator.PENERIMA_BARU_PAGE.NAMA_PENERIMA)).getText()
        
        console.debug("Name in bank: ", accName)

        let validName = tools.validateAccName(transAccData.BeneficiaryName, accName, transAccData.IgnoreByName)
        if (!validName) {
            let errMsg = `Name submitted : ${transAccData.BeneficiaryName} is different from the name in the bank : ${accName}`
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }
        
       //click lanjut 
        await (await appiumClient.$(locator.PENERIMA_BARU_PAGE.BOTTOM_LANJUTKAN_BTN)).click()
        await tools.delay(1000)

        let {isIn: inInputAmtPage} = await this.checkIsInInputAmtPage({appiumClient})
        if(inInputAmtPage === false){
            let errMsg = "FAILED TO INPUT AMT PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }
        
        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
        await tools.delay(1000)
    }

    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async transferInternalBeneficiary({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {

        transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })
        
        //click amount and input amount
        let amtCol = await appiumClient.$(locator.INPUT_AMOUNT_PAGE.AMOUNT_COL)
        await amtCol.click()
        await tools.delay(800)
        await amtCol.sendKeys(String(transAccData.Amount).split(""))
        
        //check error input amt
        let {isIn: isError, msg} = await this.checkErrorInputAmountField({appiumClient})
        if(isError === true) {
            let errMsg = msg
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click selesai
        await (await appiumClient.$(locator.INPUT_AMOUNT_PAGE.SELESAI_BTN)).click()
        await tools.delay(2000)
        
        //click and input remark
        //click tambah keterangan
        await (await appiumClient.$(locator.INPUT_AMOUNT_PAGE.TAMBAH_KET_BTN)).click()
        await tools.delay(2000)
        

        let remarkCol = await appiumClient.$(locator.INPUT_AMOUNT_PAGE.REMARK_COL)
        await remarkCol.click()
        await tools.delay(800)
        // let remark = transAccData.Remark.replace(/\s/g, "%s")
        let remark = transAccData.Remark
        await remarkCol.sendKeys(remark.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        
        //click simpan
        await (await appiumClient.$(locator.INPUT_AMOUNT_PAGE.SIMPAN_KET_BTN)).click()
        await tools.delay(2000)
        
        //lanjut to confirm
        await (await appiumClient.$(locator.INPUT_AMOUNT_PAGE.LANJUTKAN_BTN)).click()
        await tools.delay(3000)
       
    
        //double confirm
        let { isValid, msg: doubleConfirmErrMsg } = await this.doubleConfirm({ device, transAccData, appiumClient })
        if (isValid === false) {
            //click cancel X btn
            await (await appiumClient.$(locator.CONFIRM_PAGE.CANCEL_X_BTN)).click()
            await tools.delay(500)
            
            await deviceTools.clickBack({ device, count: 3, delay: 1000 })
            let errMsg = doubleConfirmErrMsg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click lanjut to input pin
        await (await appiumClient.$(locator.CONFIRM_PAGE.LANJUT_TRANS_BTN)).click()
        
        let {isIn: inInputPinPage} = await this.checkIsInInputPINPage({appiumClient}) 
        if(inInputPinPage === false){
            let errMsg = "FAILED TO INPUT PIN PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }
        
        transAccData.Status = Status.FINISHING_INTERNAL_TRANSACTION
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })
        await tools.delay(1000)
        
        //input pin
        let pins = transAccData.PIN.split("")        //inputPin
        for (let i = 0; i < pins.length; i++) {
            let nm = Number(pins[i])
            let loc = locator.INPUT_PIN_PAGE.PIN_NUMBER[nm]
            // console.debug("loc: ", loc)
            await (await appiumClient.$(loc)).click()
            await tools.delay(200)
        }
        await tools.delay(1000)

        let {isIn: isWrongPin, msg: wrongPinMsg} = await this.checkIsWrongPin({appiumClient})        
        if(isWrongPin === true){
            let errMsg = wrongPinMsg
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        let {isIn: isSuccess} = await this.checkIsInSuccessPage({appiumClient})
        if (isSuccess === true) {
            await tools.delay(1000)

                transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY_SUCCESS
                transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
                await tools.saveTransSlip({ device, transAccData })
                //click X
                await (await appiumClient.$(locator.SUCCESS_PAGE.X_BTN)).click()
                await tools.delay(1500)
        } else {
            let errMsg = "FAILED FINISHING TRANSACTION"
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

    }
    /**
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async getBalance({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        transAccData.Status = Status.GET_BALANCE
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient })
        if (isIn === false) {
            let errMsg = "GET BALANCE NOT IN DASHBOARD PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        //TODO: use this method for multi acc ?
        // let accNo = accNoTools.getAccNoByBankAndDeviceId({bank: transAccData.BankCode, deviceId: transAccData.DeviceId})
        let accNo = transAccData.BankAccountNo
        let tabunganBtn = await appiumClient.$(locator.DASHBOARD_PAGE.tabunganAccCardByNo(accNo))
        await tabunganBtn.click()
        await tools.delay(2000)


        let { isIn: inAccPage } = await this.checkIsInTabunganPage({ appiumClient })
        if (inAccPage === false) {
            let errMsg = "GET BALANCE NOT IN REKENINGKU PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }



        let balanceTag = await appiumClient.$(locator.TABUNGAN_PAGE.AVAILABLE_BALANCE)

        let balance: number | string = await balanceTag.getText()
        
        console.debug("ORI BALANCE TXT: ", balance)
        balance = balance.slice(0, balance.length - 2)
        console.debug("ORI BALANCE TXT Slice 2: ", balance)
        balance = balance.replace(/Rp\s/gm, "")
        let { success, val } = tools.parseBalanceString(balance)

        balance = success ? val : 0
        console.debug("BALANCE: ", balance)

        if (success === true) {
            transAccData.LastBalance = balance

            transAccData.Status = Status.GET_BALANCE_SUCCESS
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

            await deviceTools.clickBack({device, count: 1})
            await tools.delay(1200)
        } else {
            let errMsg = "GET BALANCE PARSING FAILED"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

    }


    /**
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async logOut({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        console.debug("Logout")
        let { isIn } = await this.checkIsInDashboardPage({ appiumClient })
        if (isIn === false) {
            let errMsg = "LOGOUT NOT IN DASHBOARD PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click logout 
        await (await appiumClient.$(locator.DASHBOARD_PAGE.LOGOUT_BTN)).click()
        await tools.delay(1000)

        //click bottom logout btn
        await (await appiumClient.$(locator.DASHBOARD_PAGE.BOTTOM_LOGOUT)).click()

    }

    /**
     * @param {{transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async getBankFee({ transAccData, appiumClient }: { transAccData: TTransAccData; appiumClient: Browser; }) {
        let feeStr = await (await appiumClient.$(locator.CONFIRM_PAGE.NOMINAL_AMOUNT)).getText()
        console.debug("Ori Bank Fee: ", feeStr)

        let { success, val } = tools.parseBalanceString(feeStr)
        transAccData.BankFee = success ? val : 0
        console.debug("BANK FEE: ", transAccData.BankFee)
    }
    /**
     * @param {{transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async doubleConfirm({device, transAccData, appiumClient }: {device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        let beneficiaryAccNoTxt = await (await appiumClient.$(locator.CONFIRM_PAGE.ACC_NO)).getText()
        beneficiaryAccNoTxt = beneficiaryAccNoTxt.trim()

        let amount = await (await appiumClient.$(locator.CONFIRM_PAGE.NOMINAL_AMOUNT)).getText()

        let strAmt = transAccData.Amount.toLocaleString('id') // 'id'  10.000
        let reqAcc = transAccData.BeneficiaryAcc
        let matchRegAmt = new RegExp(`\\D${strAmt}$`, 'gm').test(amount.replace(/Rp/, ""))
        let matchRegAcc = new RegExp(`${reqAcc}$`, 'gm').test(beneficiaryAccNoTxt)

        if (matchRegAmt && matchRegAcc) {
            return { isValid: true, msg: "" }
        } else {
            let msg = `INVALID CONFIRM: ${reqAcc} != ${beneficiaryAccNoTxt} ,trsf ${strAmt} != ${amount}`

            return { isValid: false, msg }
        }

    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInWelcomePage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.WELCOME_PAGE.LOGIN_BTN, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInLoginPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.LOGIN_PAGE.PASS_COL, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async hasLoggedOutPopup({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }){
        let found = await this.checkElementFound({ locatorStr: locator.ALERT.PANEL_CONTENT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsWrongPass({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.LOGIN_PAGE.ERROR_LABEL, appiumClient, retry, interval })
        let msg = ""
        if (found === true) {
            msg = await (await appiumClient.$(locator.LOGIN_PAGE.ERROR_LABEL)).getText()
        }
        return { isIn: found, msg }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkAlertShown({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.ALERT.MESSAGE, appiumClient, retry, interval })
        let msg = ""
        if (found === true) {
            msg = await (await appiumClient.$(locator.ALERT.MESSAGE)).getText()
        }
        return { isIn: found, msg }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInDashboardPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.LOGOUT_BTN, appiumClient, retry, interval })
        let found2 = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.TABUNGAN_DEPOSITO_TEXT, appiumClient, retry, interval })
        return { isIn: (found && found2), msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInTransPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.TRANSFER_PAGE.PENERIMA_BARU_BTN, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInPenerimaBaruPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.PENERIMA_BARU_PAGE.NO_REK_COL, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkErrorInputAccField({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.PENERIMA_BARU_PAGE.ERROR_FIELD, appiumClient, retry, interval })
        let msg = ""
        if(found === true){
            msg = await (await appiumClient.$(locator.PENERIMA_BARU_PAGE.ERROR_FIELD)).getText()
        }
        return { isIn: found, msg}
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkAccountShown({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.PENERIMA_BARU_PAGE.NAMA_PENERIMA, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInInputAmtPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_AMOUNT_PAGE.TAMBAH_KET_BTN, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkErrorInputAmountField({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_AMOUNT_PAGE.ERROR_FIELD, appiumClient, retry, interval })
        let msg = ""
        if(found === true){
            msg = await (await appiumClient.$(locator.INPUT_AMOUNT_PAGE.ERROR_FIELD)).getText()
        }
        return { isIn: found, msg}
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInInputPINPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_PIN_PAGE.TITLE, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsWrongPin({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_PIN_PAGE.ERROR_PIN, appiumClient, retry, interval })
        let msg = ""
        if(found === true){
            msg = await (await appiumClient.$(locator.INPUT_PIN_PAGE.ERROR_PIN)).getText()
        }
        return { isIn: found, msg }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInSuccessPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.SUCCESS_PAGE.BERHASIL_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInTabunganPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.TABUNGAN_PAGE.AVAILABLE_BALANCE, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{locatorStr: String, appiumClient: Browser, retry: Number, interval: Number}} 
     */
    async checkElementFound({ locatorStr, appiumClient, retry = 2, interval = 1000 }: { locatorStr: string; appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await (await appiumClient.$(locatorStr)).isDisplayed().catch(_err => {return false})

        if (found) {
            return true
        } else {
            if (retry > 0) {
                await tools.delay(interval)
                return await this.checkElementFound({ locatorStr, appiumClient, retry: retry - 1, interval })
            } else {
                return false
            }
        }
    }
}

export { Mandiri }