
import { deviceTools } from "../../android/DeviceTools.js";
import { appiumTools } from "../../appium/AppiumTools.js";
import { msgLogger } from "../../libs/MsgLogger.js";
import { tools } from "../../libs/Tools.js";
import { locator } from "./LocatorBRI.js"
import { bankConfig } from "./ConfigBRI.js";
import { transStatus } from "../../libs/TransStatus.js";
/**
 * @typedef {import("../../libs/TypeDef").TransAccData} TransAccData
 * @typedef {import("../../libs/TypeDef").AppiumServer} AppiumServer
 * @typedef {WebdriverIO.Browser} Browser
 * @typedef {import("@u4/adbkit").Device} Device
 */
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

class BRI {
    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, server: AppiumServer}}  
     */
    async processTransferReq({ device, transAccData, server }) {
        // console.debug(`Process BRI in ${device.id}`, transAccData, server)
        msgLogger.debug({ msg: `Process ${transAccData.BankCode} in ${device.id}`, transAccData, server })

        transAccData.Status = Status.START_PROCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        let appiumClient
        try {

            //check if RequestAt longer than 6 min abort
            let now = new Date()
            let deltaDate = now - new Date(transAccData.RequestAt)
            if (deltaDate > 360000) {
                let errMsg = `Too many queues`
                transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
                throw { message: errMsg, expected: true }
            }

            //PREVENT socket hang up by server in device ??
            await deviceTools.killAppiumASettings({device})
            
            
            console.debug("createAppiumClient")
            appiumClient = await appiumTools.createAppiumClient({ server })

            if (await deviceTools.isSleeping({ device })) {
                await deviceTools.wakeUp({ device })
            }

            await deviceTools.clickHome({ device })

            //pancing 1st appium
            // console.time("pancing 1st")
            await appiumClient.getPageSource()
            // console.timeEnd("pancing 1st")

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
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser , retry: Number}}  
     */
    async openApp({ device, transAccData, appiumClient, retry = 2 }) {
        transAccData.Status = Status.OPEN_APPLICATION
        // let deviceConfig = configBank.devicesById(device.id)
        // let start = new Date();

        if (retry <= 0) { throw {message: "RETRY OVER", expected: true} }
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

        if (currActivity.includes(bankConfig.activityDashboardIB)) {
            console.debug("in dashboard")
            // inDashboard 
            // click transferIcon to test if session still valid    
            let transferIcon = appiumClient.$(locator.DASHBOARD_PAGE.TRANSFER_ICON)
            await transferIcon.click()

            await tools.delay(2000)
            let activity = await deviceTools.getActivity({ device });
            if (activity.includes(bankConfig.activityFormTransferAlias)) {
                // back to dashboard
                await deviceTools.clickBack({ device })
                return
            }
        }

        currActivity = await deviceTools.getActivity({ device })

        if (currActivity.includes(bankConfig.activityFastMenu)) {
            // in fast menu page 
            await tools.delay(2000)
            //click to login page
            // let fastBtnRef = await appiumClient.findElement("id", "id.co.bri.brimo:id/btnfast")
            // let fastBtn = await appiumClient.$(fastBtnRef)
            let fastLoginBtn = await appiumClient.$(locator.FAST_MENU_PAGE.LOGIN_BTN)
            await fastLoginBtn.click()
            await tools.delay(2000)

            let { isIn } = await this.checkIsInLoginPage({ appiumClient })
            if (isIn === false) {
                throw {message: `${transAccData.Status.desc} Failed err: Failed Open Login Page`, expected: true}
            }

        } else {
            await deviceTools.killApplication({ device, packageName: bankConfig.packageName })
            await tools.delay(1500)
            return await this.openApp({ device, transAccData, appiumClient, retry: retry - 1 })
        }

    }

    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async logIn({ device, transAccData, appiumClient }) {
        transAccData.Status = Status.LOGIN
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let curActivity = await deviceTools.getActivity({ device })
        if (curActivity.includes(bankConfig.activityDashboardIB)) {
            //already login
            return
        }


        let userNameField = await appiumClient.$(locator.LOGIN_PAGE.USERNAME)
        let passwordField = await appiumClient.$(locator.LOGIN_PAGE.PASSWORD)
        let loginBtn = await appiumClient.$(locator.LOGIN_PAGE.LOGIN_BTN)

        //username
        await userNameField.click()
        await userNameField.sendKeys(transAccData.UserId.split(""))
        await tools.delay(1000)
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        //password
        await passwordField.click()
        await passwordField.sendKeys(transAccData.AppPassword.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        await tools.delay(1000)
        //login
        await loginBtn.click()
        await tools.delay(1000)

        // check alert if wrong pass /user 
        let {isIn: alertShown, msg} = await this.checkAlertShown({appiumClient})
        if(alertShown === true){
            let errMsg = msg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        await this.handleDashboardPopUp({ device, transAccData, appiumClient })

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient, retry: 5 })
        if (isIn === false) {
            let errMsg = "FAILED LOGIN"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

    }

    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async handleDashboardPopUp({ _device, _transAccData, appiumClient }) {
        let found = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.POPUP_CLOSE_BTN, appiumClient })
        if (found === true) {
            let closePopUpBtn = await appiumClient.$(locator.DASHBOARD_PAGE.POPUP_CLOSE_BTN)
            await closePopUpBtn.click()
        }
    }
    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async openInternalTransfer({ _device, transAccData, appiumClient }) {
        transAccData.Status = Status.OPEN_INTERNAL_TRANSFER
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        //click transferIcon
        let iconBtn = await appiumClient.$(locator.DASHBOARD_PAGE.TRANSFER_ICON)
        await iconBtn.click()
        await tools.delay(1500)

        let { isIn } = await this.checkIsInFormTransferAliasPage({ appiumClient })
        if (isIn === false) {
            let errMsg = "CAN NOT OPEN FORM TRANSFER ALIAS PAGE"
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        let tambahBtn = await appiumClient.$(locator.FORM_TRANSFER_ALIAS_PAGE.TAMBAH_DAFTAR_BARU_BTN)
        await tambahBtn.click()

        await tools.delay(2000)

        transAccData.Status = Status.OPEN_INTERNAL_TRANSFER_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
    }

    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async registerInternalBeneficiary({ device, transAccData, appiumClient }) {
        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn: inTambahPage } = await this.checkIsInTambahTransferAliasPage({ appiumClient })
        if (inTambahPage === false) {
            let errMsg = "CAN NOT OPEN TAMBAH TRANSFER ALIAS PAGE"
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        // input acc no
        let rekField = await appiumClient.$(locator.TAMBAH_TRANSFER_ALIAS_PAGE.REKENING_FIELD)
        await rekField.click()
        await rekField.sendKeys(transAccData.BeneficiaryAcc.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        await tools.delay(1000)

        let tambahBaruBtn = await appiumClient.$(locator.TAMBAH_TRANSFER_ALIAS_PAGE.TAMBAH_BARU_BTN)
        await tambahBaruBtn.click()

        await tools.delay(1000)

        let {isIn: alertShown, msg} = await this.checkAlertShown({appiumClient})
        if(alertShown === true){
            let errMsg = msg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        let { isIn: inQuiryGeneralPage } = await this.checkIsInInquiryGeneralPage({ appiumClient })
        if (inQuiryGeneralPage === false) {
            let errMsg = "FAILED REGISTER"
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }
        await tools.delay(1000)

        let accName = await (await appiumClient.$(locator.INQUIRY_GENERAL_PAGE.ACC_NAME)).getText()
        console.debug("Name in bank: ", accName)
        let validName = tools.validateAccName(transAccData.BeneficiaryName, accName, transAccData.IgnoreByName)
        if (!validName) {
            let errMsg = `Name submitted : ${transAccData.BeneficiaryName} is different from the name in the bank : ${accName}`
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
    }
    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async transferInternalBeneficiary({ device, transAccData, appiumClient }) {

        transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn: inQuiryGeneralPage } = await this.checkIsInInquiryGeneralPage({ appiumClient })
        if (inQuiryGeneralPage === false) {
            let errMsg = `FAILED TO STEP INPUT AMOUNT`
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click amount and input amount
        let amtCol = await appiumClient.$(locator.INQUIRY_GENERAL_PAGE.AMOUNT_COL)
        await amtCol.click()
        await tools.delay(800)

        await amtCol.sendKeys(String(transAccData.Amount).split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        //check balance not enough
        let { isIn: balanceNotEnough, msg: notEnoughMsg } = await this.checkIsBalanceNotEnough({ appiumClient })
        if (balanceNotEnough === true) {
            await deviceTools.clickBack({ device, count: 3 })
            let errMsg = notEnoughMsg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click transfer
        let trsfBtn = await appiumClient.$(locator.INQUIRY_GENERAL_PAGE.TRANSFER_BTN)
        await trsfBtn.click()

        await tools.delay(5000)

        let { isIn: inConfirmPage } = await this.checkIsInConfirmPage({ appiumClient })
        if (inConfirmPage === false) {
            let errMsg = "FAILED TO CONFIRM PAGE"
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click and input remark
        let remarkCol = await appiumClient.$(locator.CONFIRM_PAGE.REMARK_COL)
        await remarkCol.click()
        await tools.delay(800)
        // let remark = transAccData.Remark.replace(/\s/g, "%s")
        let remark = transAccData.Remark
        await remarkCol.sendKeys(remark.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        //double confirm
        let { isValid, msg: doubleConfirmErrMsg } = await this.doubleConfirm({ device, transAccData, appiumClient })
        if (isValid === false) {

            await deviceTools.clickBack({ device })
            await appiumClient.$(locator.CONFIRM_PAGE.BATAL_POPUP)
            await (await appiumClient.$(locator.CONFIRM_PAGE.BATAL_YES_BTN)).click()
            await tools.delay(1000)
            await deviceTools.clickBack({ device, count: 2, delay: 1500 })

            //TODO: must logout ??
            let errMsg = doubleConfirmErrMsg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //get fee
        await this.getBankFee({ transAccData, appiumClient })

        //click transfer
        await (await appiumClient.$(locator.CONFIRM_PAGE.TRANSFER_BTN)).click()

        await tools.delay(1000)

        //check in input pin
        let { isIn: inInputPin } = await this.checkIsInInputPinPage({ appiumClient })
        if (inInputPin === false) {
            let errMsg = "FAILED TO INPUT PIN PAGE"
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        transAccData.Status = Status.FINISHING_INTERNAL_TRANSACTION
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let pins = transAccData.PIN.split("")        //inputPin
        for (let i = 0; i < pins.length; i++) {
            let nm = Number(pins[i])
            let loc = locator.INPUT_PIN_PAGE.PIN_NUMBER[nm]
            // console.debug("loc: ", loc)
            await (await appiumClient.$(loc)).click()
            await tools.delay(200)
        }

        await tools.delay(1000)

        // check alert if wrong pin 
        let {isIn: alertShown, msg} = await this.checkAlertShown({appiumClient})
        if(alertShown === true){
            let errMsg = msg
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //check in receipt page
        let { isIn: inReceiptPage } = await this.checkIsInReceiptPage({ appiumClient, retry: 3, interval: 2000 })
        if (inReceiptPage === true) {
            await tools.delay(1200)
            transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY_SUCCESS
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
            await tools.saveTransSlip({ device, transAccData, useFFmpeg: false })
            await tools.delay(500)

            await (await appiumClient.$(locator.RECEIPT_PAGE.OK_BTN)).click()
            await tools.delay(1500)
        } else {
            let errMsg = "FAILED FINISHING TRANSACTION"
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }
    }

    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async getBalance({ _device, transAccData, appiumClient }) {
        transAccData.Status = Status.GET_BALANCE
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient })
        if (isIn === false) {
            let errMsg = "GET BALANCE NOT IN DASHBOARD PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        let rekeningLainBtn = await appiumClient.$(locator.DASHBOARD_PAGE.REKENING_LAIN)
        rekeningLainBtn.click()
        await tools.delay(3000)


        let { isIn: inAccPage } = await this.checkIsInAccountPage({ appiumClient })
        if (inAccPage === false) {
            let errMsg = "GET BALANCE NOT IN ACCOUNT PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        let balanceTag = await appiumClient.$(locator.ACCOUNT_PAGE.BALANCE_TAG)

        let balance = await balanceTag.getText()

        //bri Rp682.067,00 or Rp494.500.00
        console.debug("ORI BALANCE TXT: ", balance)
        balance = balance.replace(/Rp/gm, "")
        let { success, val } = tools.parseBalanceString(balance)

        balance = success ? val : 0
        console.debug("BALANCE: ", balance)

        if (success === true) {
            //TODO: multi acc
            transAccData.LastBalance = balance

            transAccData.Status = Status.GET_BALANCE_SUCCESS
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

            let backArrow = await appiumClient.$(locator.ACCOUNT_PAGE.BACK_ARROW)
            await backArrow.click()
            await tools.delay(1200)
        } else {
            let errMsg = "GET BALANCE PARSING FAILED"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

    }


    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async logOut({ device, transAccData, appiumClient }) {
        console.debug("Logout")
        let { isIn } = await this.checkIsInDashboardPage({ appiumClient })
        if (isIn === false) {
            let errMsg = "LOGOUT NOT IN DASHBOARD PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        await deviceTools.clickBack({ device })

        let confirmLogOut = await appiumClient.$(locator.DASHBOARD_PAGE.LOG_OUT_CONFIRM)
        if (confirmLogOut) {
            let yesBtn = await appiumClient.$(locator.DASHBOARD_PAGE.LOG_OUT_YES_BTN)
            await yesBtn.click()
        }
    }

    /**
     * @param {{transAccData: TransAccData, appiumClient: Browser}}  
     */
    async doubleConfirm({ transAccData, appiumClient }) {
        let beneficiaryAccNoTxt = await (await appiumClient.$(locator.CONFIRM_PAGE.BENEFICIARY_ACC_NO)).getText()
        beneficiaryAccNoTxt = beneficiaryAccNoTxt.trim()

        let amount = await (await appiumClient.$$(locator.CONFIRM_PAGE.VALUE_FIELD)[0]).getText()

        let strAmt = transAccData.Amount.toLocaleString('id') // 'id'  10.000.000
        let reqAcc = transAccData.BeneficiaryAcc
        let matchRegAmt = new RegExp(`\\D${strAmt}$`, 'gm').test(amount.replace(/Rp/gm, " "))
        let matchRegAcc = new RegExp(`${reqAcc}$`, 'gm').test(beneficiaryAccNoTxt)

        if (matchRegAmt && matchRegAcc) {
            return { isValid: true, msg: "" }
        } else {
            let msg = `INVALID CONFIRM: ${beneficiaryAccNoTxt}  trsf ${amount}`

            return { isValid: false, msg }
        }

    }
    /**
     * @param {{transAccData: TransAccData, appiumClient: Browser}}  
     */
    async getBankFee({ transAccData, appiumClient }) {
        let feeStr = await (await appiumClient.$$(locator.CONFIRM_PAGE.VALUE_FIELD)[1]).getText()
        console.debug("Ori Bank Fee: ", feeStr)
        feeStr = feeStr.replace(/Rp/gm, " ")

        let { success, val } = tools.parseBalanceString(feeStr)
        transAccData.BankFee = success ? val : 0

        console.debug("BANK FEE: ", transAccData.BankFee)
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInLoginPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.LOGIN_PAGE.USERNAME, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInDashboardPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.REKENING_LAIN, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInFormTransferAliasPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.FORM_TRANSFER_ALIAS_PAGE.DAFTAR_TRANSFER_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInTambahTransferAliasPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.TAMBAH_TRANSFER_ALIAS_PAGE.REKENING_FIELD, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInInquiryGeneralPage({ appiumClient, retry = 2, interval = 1000 }) {
        // let found = await this.checkElementFound({ locatorStr: locator.INQUIRY_GENERAL_PAGE.SIMPAN_SELANJUTNYA, appiumClient, retry, interval })
        let found = await this.checkElementFound({ locatorStr: locator.INQUIRY_GENERAL_PAGE.ACC_NAME, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsBalanceNotEnough({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.INQUIRY_GENERAL_PAGE.SALDO_TDK_CUKUP_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "Saldo Anda tidak cukup" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInConfirmPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.CONFIRM_PAGE.KONFIRMASI_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInInputPinPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_PIN_PAGE.MASUKAN_PIN_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkAlertShown({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.ALERT, appiumClient, retry, interval })
        let msg = ""
        if (found === true){
             msg = await (await appiumClient.$(locator.ALERT)).getText() || "ALERT"
        }
        return { isIn: found, msg}
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInReceiptPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.RECEIPT_PAGE.BERHASIL_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInAccountPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.ACCOUNT_PAGE.BALANCE_TAG, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{locatorStr: String, appiumClient: Browser, retry: Number, interval: Number}} 
     */
    async checkElementFound({ locatorStr, appiumClient, retry = 2, interval = 1000 }) {
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

export { BRI }