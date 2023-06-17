

import { deviceTools } from "../../android/DeviceTools.js";
import { appiumTools } from "../../appium/AppiumTools.js";
import { msgLogger } from "../../libs/MsgLogger.js";
import { tools } from "../../libs/Tools.js";
import { locator } from "./LocatorBNI.js";
import { bankConfig } from "./ConfigBNI.js";
import { transStatus } from "../../libs/TransStatus.js";
import { TAppiumServer, TDevice, TTransAccData } from "../../types/templateService.js";
import { Browser } from "webdriverio";
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

class BNI {
    /**
     * 
     * @param {{device: TDevice, transAccData: TTransAccData, server: AppiumServer}}  
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

        //check is in dashboard
        let { isIn: inDashboard } = await this.checkIsInDashboardPage({ appiumClient })
        if (inDashboard === true) {
            console.debug("in dashboard")
            // inDashboard 
            // click transferIcon to test if session still valid    
            let transferIcon = appiumClient.$(locator.DASHBOARD_PAGE.TRANSFER_ICON)
            await transferIcon.click()

            await tools.delay(2000)

            console.debug("HANDLE SESSION OVER")
            let { isIn: alertShown } = await this.checkAlertShown({ appiumClient })
            if (alertShown === true) {
                //click ok 
                await (await appiumClient.$(locator.ALERT.OK_BTN)).click()
                await tools.delay(3000)
            } else {
                let { isIn: inTransferPage } = await this.checkIsInTransferPage({ appiumClient })
                if (inTransferPage === true) {
                    //session still valid
                    //back to dashboard page
                    await deviceTools.clickBack({ device, count: 1, delay: 2000 })
                    return
                }
            }
        }

        currActivity = await deviceTools.getActivity({ device })

        //check in welcome page 
        if (currActivity.includes(bankConfig.activityMain)) {
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

        let passwordField = await appiumClient.$(locator.LOGIN_PAGE.MPIN_FIELD)
        let loginBtn: WebdriverIO.Element = await appiumClient.$$(locator.LOGIN_PAGE.LOGIN_BTN)[1] as WebdriverIO.Element

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
        let { isIn: wrongPass, msg } = await this.checkIsWrongPass({ appiumClient })
        if (wrongPass === true) {
            let errMsg = msg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient, retry: 10 })
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
        await (await appiumClient.$(locator.DASHBOARD_PAGE.TRANSFER_ICON)).click()
        await tools.delay(1000)

        let { isIn: inTransferPage } = await this.checkIsInTransferPage({ appiumClient , retry: 5})
        if (inTransferPage === false) {
            let errMsg = "FAILED OPEN TRANSFER PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click antar BNI
        await (await appiumClient.$(locator.TRANSFER_PAGE.BNI_ICON)).click()
        await tools.delay(2000)

        let { isIn: inAntarBni } = await this.checkIsInAntarBNIPage({ appiumClient, retry: 5 })
        if (inAntarBni === false) {
            let errMsg = "FAILED OPEN ANTAR BNI PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        await tools.delay(1000)
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

        //TODO multi acc

        //click input baru
        await (await appiumClient.$(locator.ANTAR_BNI_PAGE.INPUT_BARU)).click()
        await tools.delay(1000)

        //click and input rek tujuan
        let rekField = await appiumClient.$(locator.ANTAR_BNI_PAGE.REK_COL)
        await rekField.click()
        await tools.delay(1000)
        await rekField.sendKeys(transAccData.BeneficiaryAcc.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }
        await tools.delay(1000)

        let rekFieldY = await rekField.getLocation("y")
        await deviceTools.inputTap({ device, x: 2, y: rekFieldY })
        await tools.delay(1000)
        await appiumClient.$(locator.ANTAR_BNI_PAGE.SCROLL_TO_BOTTOM)

        //click and input amount
        let amountCol = await appiumClient.$(locator.ANTAR_BNI_PAGE.AMOUNT_COL)
        await amountCol.click()
        await tools.delay(500)
        await amountCol.sendKeys(String(transAccData.Amount).split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        //click and input Remark
        let remarkCol = await appiumClient.$(locator.ANTAR_BNI_PAGE.REMARK_COL)
        await remarkCol.click()
        await tools.delay(1000)
        // let remark = transAccData.Remark.replace(/\s/g, "%s")
        let remark = transAccData.Remark
        await remarkCol.sendKeys(remark.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        //click selanjutnya 
        await (await appiumClient.$(locator.ANTAR_BNI_PAGE.SELANJUTNYA_BTN)).click()

        await tools.delay(2000)

        let { isIn: alertShown, msg } = await this.checkAlertShown({ appiumClient })
        if (alertShown === true) {
            //click ok 
            await (await appiumClient.$(locator.ALERT.OK_BTN)).click()
            let errMsg = msg
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        let { isIn: inValidasiPage } = await this.checkIsInValidationPage({ appiumClient })
        if (inValidasiPage === false) {
            let errMsg = "FAILED OPEN VALIDATION PAGE"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        let accName = await (await appiumClient.$(locator.VALIDATION_PAGE.NAMA_PENERIMA)).getText()

        console.debug("Name in bank: ", accName)

        let validName = tools.validateAccName(transAccData.BeneficiaryName, accName, transAccData.IgnoreByName)
        if (!validName) {
            let errMsg = `Name submitted : ${transAccData.BeneficiaryName} is different from the name in the bank : ${accName}`
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
        await tools.delay(1000)
    }
    /**
     * @param {{device: TDevice, transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async transferInternalBeneficiary({ device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {

        transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })


        //double confirm
        let { isValid, msg: doubleConfirmErrMsg } = await this.doubleConfirm({ device, transAccData, appiumClient })
        if (isValid === false) {

            await deviceTools.clickBack({ device, count: 3, delay: 1000 })
            let errMsg = doubleConfirmErrMsg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //get fee
        await this.getBankFee({ transAccData, appiumClient })

        //click and input password
        let passCol = await appiumClient.$(locator.VALIDATION_PAGE.PASSWORD_COL)
        await passCol.click()
        await tools.delay(500)
        await passCol.sendKeys(transAccData.PIN.split(""))
        if (deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        transAccData.Status = Status.FINISHING_INTERNAL_TRANSACTION
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        //click selanjutnya 
        await (await appiumClient.$(locator.VALIDATION_PAGE.SELANJUTNYA_BTN)).click()

        await tools.delay(2000)
        let { isIn: alertShown, msg } = await this.checkAlertShown({ appiumClient })
        if (alertShown === true) {
            //click ok 
            await (await appiumClient.$(locator.ALERT.OK_BTN)).click()
            let errMsg = msg
            transStatus.failed997({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        let { isIn: inStatusPage } = await this.checkIsInStatusPage({ appiumClient, retry: 5 })
        if (inStatusPage === true) {
            await tools.delay(1000)

            let { isIn: transactionSuccess } = await this.checkTransactionSuccess({ appiumClient, retry: 3 })
            if (transactionSuccess === true) {
                transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY_SUCCESS
                transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
                await tools.saveTransSlip({ device, transAccData })
                await (await appiumClient.$(locator.STATUS_PAGE.KEMBALI_BTN)).click()
                await tools.delay(1500)
            } else {

                let errMsg = "FAILED FINISHING TRANSACTION"
                transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
                throw { message: errMsg, expected: true }
            }
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

        let rekeningLainBtn = await appiumClient.$(locator.DASHBOARD_PAGE.REKENINGKU_ICON)
        await rekeningLainBtn.click()
        await tools.delay(2000)


        let { isIn: inAccPage } = await this.checkIsInRekeningkuPage({ appiumClient })
        if (inAccPage === false) {
            let errMsg = "GET BALANCE NOT IN REKENINGKU PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click tabungan_and_giro
        await (await appiumClient.$(locator.REKENINGKU_PAGE.TABUNGAN_ICON)).click()
        let { isIn: inTabunganPage } = await this.checkIsInTabunganPage({ appiumClient })
        if (inTabunganPage === false) {
            let errMsg = "GET BALANCE NOT IN TABUNGAN PAGE"
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        let accNo = transAccData.BankAccountNo
        let selector = locator.TABUNGAN_PAGE.tabunganAccCardByNo(accNo)
        let accCard = await appiumClient.$(selector)
        await accCard.click()
        await tools.delay(2000)


        let balanceTag = await appiumClient.$(locator.TABUNGAN_PAGE.SALDO_EFEKTIF)
        let balance : number | string = await balanceTag.getText()

        // 6.500,00
        console.debug("ORI BALANCE TXT: ", balance)
        balance  = balance.replace(/Rp/gm, "")
        let { success, val } = tools.parseBalanceString(balance)

        balance = success ? val : 0
        console.debug("BALANCE: ", balance)

        if (success === true) {
            //TODO: multi acc
            transAccData.LastBalance = balance

            transAccData.Status = Status.GET_BALANCE_SUCCESS
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

            let homeIcon = await appiumClient.$(locator.TABUNGAN_PAGE.HOME_ICON)
            await homeIcon.click()
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
        await (await appiumClient.$(locator.DASHBOARD_PAGE.LOGOUT_ICON)).click()
        await tools.delay(1000)

        //click ya btn
        await (await appiumClient.$(locator.DASHBOARD_PAGE.LOGOUT_YA_BTN)).click()

    }

    /**
     * @param {{transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async getBankFee({ transAccData, appiumClient }: { transAccData: TTransAccData; appiumClient: Browser; }) {
        let feeStr = await (await appiumClient.$(locator.VALIDATION_PAGE.FEE)).getText()
        console.debug("Ori Bank Fee: ", feeStr)

        let { success, val } = tools.parseBalanceString(feeStr)
        transAccData.BankFee = success ? val : 0
        console.debug("BANK FEE: ", transAccData.BankFee)
    }
    /**
     * @param {{transAccData: TTransAccData, appiumClient: Browser}}  
     */
    async doubleConfirm({device, transAccData, appiumClient }: { device: TDevice; transAccData: TTransAccData; appiumClient: Browser; }) {
        let beneficiaryAccNoTxt = await (await appiumClient.$(locator.VALIDATION_PAGE.REK_TUJUAN)).getText()
        beneficiaryAccNoTxt = beneficiaryAccNoTxt.trim()

        let amount = await (await appiumClient.$(locator.VALIDATION_PAGE.NOMINAL)).getText()

        let strAmt = transAccData.Amount.toLocaleString('id') // 'id'  10.000

        // "0202269804" to number then to string
        let reqAcc = String(Number(transAccData.BeneficiaryAcc))

        let matchRegAmt = new RegExp(`${strAmt}$`, 'gm').test(amount)
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
    async checkIsInLoginPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.LOGIN_PAGE.MPIN_FIELD, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsWrongPass({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.LOGIN_PAGE.WRONG_PASS, appiumClient, retry, interval })
        let msg = ""
        if (found === true) {
            msg = await (await appiumClient.$(locator.LOGIN_PAGE.WRONG_PASS)).getText()
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
        let found = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.REKENINGKU_ICON, appiumClient, retry, interval })
        let found2 = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.TRANSFER_ICON, appiumClient, retry, interval })
        if(!found || !found2){
            console.log(`BNI checkIsINDashboardPage found1:${found}, found2: ${found2}`)
        }
        return { isIn: (found && found2), msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInTransferPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.TRANSFER_PAGE.METODE_TRANSFER_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInAntarBNIPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.ANTAR_BNI_PAGE.INPUT_BARU, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInValidationPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.VALIDATION_PAGE.VALIDASI_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInStatusPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.STATUS_PAGE.STATUS_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkTransactionSuccess({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.STATUS_PAGE.BERHASIL, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInRekeningkuPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.REKENINGKU_PAGE.TABUNGAN_ICON, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInTabunganPage({ appiumClient, retry = 2, interval = 1000 }: { appiumClient: Browser; retry?: number; interval?: number; }) {
        let found = await this.checkElementFound({ locatorStr: locator.TABUNGAN_PAGE.SALDO_EFEKTIF_TEXT, appiumClient, retry, interval })
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

export { BNI }