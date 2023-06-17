import { deviceTools } from "../../android/DeviceTools.js";
import { appiumTools } from "../../appium/AppiumTools.js";
import { msgLogger } from "../../libs/MsgLogger.js";
import { tools } from "../../libs/Tools.js";
import { locator } from "./LocatorBCA.js"
import { bankConfig } from "./ConfigBCA.js";
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

class BCA {

    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, server: AppiumServer}}  
     */
    async processTransferReq({ device, transAccData, server }) {
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
            await this.deleteInternalBeneficiary({device, transAccData, appiumClient})
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

        if (retry <= 0) { throw "RETRY OVER" }

        if (await deviceTools.checkKeyboardShown({ device })) {
            await deviceTools.clickBack({ device })
        }

        let currActivity = await deviceTools.getActivity({ device })
        if (currActivity.split("/")[0] != bankConfig.packageName) {
            await deviceTools.openApplication({ device, activity: bankConfig.activityLaunch })
            await tools.delay(6000)
            currActivity = await deviceTools.getActivity({ device })
        }

        let { isIn: inDashboard } = await this.checkIsInDashboardPage({ appiumClient })
        if (inDashboard === true) {
            return
        }

        let { isIn: inWelcomePage } = await this.checkIsInWelcomePage({ appiumClient })
        if (inWelcomePage === true) {
            let windowNumber = await deviceTools.interestingWindowNumber({ device, activity: bankConfig.packageName })
            if (windowNumber > 1) {
                await deviceTools.inputTap({ device, x: 0, y: 0 })
            }
            await tools.delay(1000)
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
    async logIn({ _device, transAccData, appiumClient }) {
        transAccData.Status = Status.LOGIN
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn: inDashboardPage } = await this.checkIsInDashboardPage({ appiumClient })
        if (inDashboardPage === true) {
            //already loggedin
            return
        }

        //click m-bca
        await (await appiumClient.$(locator.WELCOME_PAGE.M_BCA_BTN)).click()
        await tools.delay(1000)

        //TODO: ?
        // let {isIn: kodeAksesShown} = await this.checkKodeAksesShown({appiumClient})
        // if(kodeAksesShown === false){
        //     let errMsg = "FAILED SHOW KODE AKSES"
        //     transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
        //     throw { message: errMsg, expected: true }
        // }

        //click and input pass
        let passCol = await appiumClient.$(locator.WELCOME_PAGE.PASS_COL)
        await passCol.click()
        await tools.delay(1000)
        await passCol.sendKeys(transAccData.AppPassword.split(""))
        await tools.delay(500)

        //click login
        await (await appiumClient.$(locator.WELCOME_PAGE.LOGIN_BTN)).click()
        await tools.delay(2000)

        let { isIn: inDashboard } = await this.checkIsInDashboardPage({ appiumClient })
        if (inDashboard === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED LOGIN"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

    }
    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async openInternalTransfer({ _device, transAccData, appiumClient }) {

        transAccData.Status = Status.OPEN_INTERNAL_TRANSFER
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        //klik m-transfer
        await (await appiumClient.$(locator.DASHBOARD_PAGE.M_TRANSFER_ICON)).click()

        let { isIn } = await this.checkIsInMTransferPage({ appiumClient })
        if (isIn === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED TO M-TRANSFER PAGE"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

    }
    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async registerInternalBeneficiary({ device, transAccData, appiumClient }) {

        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        //click daftar rek antar rek
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.DAFTAR_ANTAR_REK_BTN)).click()
        await tools.delay(2000)

        //click and input acc no col 1
        let recTujuanCol1 = await appiumClient.$(locator.M_TRANSFER_PAGE.NO_REK_TUJUAN_COL_1)
        await recTujuanCol1.click()
        await tools.delay(1000)
        await recTujuanCol1.sendKeys(transAccData.BeneficiaryAcc.split(""))
        await tools.delay(500)

        let { isIn: isGreen } = await this.checkIndicatorIsGreen({ appiumClient, retry: 5 })
        if (isGreen === false) {
            let errMsg = `${transAccData.Status.desc} INDICATOR NOT GREEN`
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click send
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.SEND_BTN)).click()
        await tools.delay(2000)


        let { isIn: registerNameResultShown } = await this.checkIsInRegisterNameResultPage({ appiumClient, retry: 5 })
        if (registerNameResultShown === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "REGISTER NAME RESULT NOT SHOWN"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }


        let accName = await (await appiumClient.$(locator.M_TRANSFER_PAGE.ACC_NAME_FIELD)).getText()

        console.debug("Name in bank: ", accName)

        if (accName == "INVALID") {
            let errMsg = "INVALID ACCOUNT NUMBER"
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        if (accName == "ALREADY REGISTERED") {
            transAccData.Status = Status.INTERNAL_BENEFICIARY_ALREADY_REGISTERED
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
            await deviceTools.clickBack({ device, count: 2 })
            return
        }


        let validName = tools.validateAccName(transAccData.BeneficiaryName, accName, transAccData.IgnoreByName)
        if (!validName) {
            let errMsg = `Name submitted : ${transAccData.BeneficiaryName} is different from the name in the bank : ${accName}`
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //centang acc
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.CENTANG_ACC)).click()

        let { isIn: isGreen2 } = await this.checkIndicatorIsGreen({ appiumClient, retry: 5 })
        if (isGreen2 === false) {
            let errMsg = `${transAccData.Status.desc} INDICATOR NOT GREEN`
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click send
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.SEND_BTN)).click()
        await tools.delay(1000)


        //input pin
        let pinCol = await appiumClient.$(locator.PIN_DIALOG.INPUT_COL)
        await tools.delay(1000)
        await pinCol.sendKeys(transAccData.PIN.split(""))
        await tools.delay(500)

        //click ok
        await (await appiumClient.$(locator.PIN_DIALOG.OK_BTN)).click()
        await tools.delay(2000)

        //TODO: check sending ?

        let { isIn: successRegistered } = await this.checkNameRegistedSuccess({ appiumClient, retry: 5 })
        if (successRegistered === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED REGISTER NAME"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }


        transAccData.Status = Status.REGISTER_INTERNAL_BENEFICIARY_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

        //click ok btn
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.OK_BTN)).click()

        await tools.delay(1500)
    }
    /**
     * 
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async transferInternalBeneficiary({ device, transAccData, appiumClient }) {

        transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn } = await this.checkIsInMTransferPage({ appiumClient, retry: 5 })
        if (isIn === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED TO M-TRANSFER PAGE AFTER REGISTER"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click trans antar rek
        await (await appiumClient.$(locator.M_TRANSFER_PAGE.TRANS_ANTAR_REK_BTN)).click()
        await tools.delay(2000)

        let { isIn: inInputTransInfo } = await this.checkIsInInputTransInfoPage({ appiumClient, retry: 5 })

        if (inInputTransInfo === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED TO INPUT TRANS INFO PAGE"})
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }

        }

        //click beneficiary list
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.TO_INPUT_BENEFICIARY_PAGE_BTN)).click()
        await tools.delay(1000)

        //click and search col
        let searchCol = await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.SEARCH_COL)
        await tools.delay(1000)
        await searchCol.sendKeys(transAccData.BeneficiaryAcc.split(""))
        await tools.delay(500)
        //click 1st col 
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.FIRST_SEARCH_RES)).click()
        await tools.delay(2000)

        //click transfer amount col
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_AMT_BTN)).click()
        let amtCol = await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_AMT_COL)
        await amtCol.click()
        await tools.delay(1000)
        await amtCol.sendKeys(String(transAccData.Amount).split(""))
        await tools.delay(500)
        //click ok
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_AMT_OK_BTN)).click()


        //click remark col
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_REMARK_BTN)).click()
        let remarkCol = await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_REMARK_COL)
        await remarkCol.click()
        await tools.delay(1000)
        // let remark = transAccData.Remark.replace(/\s/g, "%s")
        let remark = transAccData.Remark
        await remarkCol.sendKeys(remark.split(""))
        await tools.delay(500)
        //click ok
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.INPUT_REMARK_OK_BTN)).click()

        let { isIn: isGreen } = await this.checkIndicatorIsGreen({ appiumClient, retry: 5 })
        if (isGreen === false) {
            let errMsg = `${transAccData.Status.desc} INDICATOR NOT GREEN`
            transStatus.failed996({ transAccData, errMsg, statusDesc: errMsg })
            throw { message: errMsg, expected: true }
        }

        //click send btn
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.SEND_BTN)).click()
        await tools.delay(2000)

        let {isIn: confirmShown} = await this.checkIsInConfirmPage({appiumClient, retry: 6}) 
        if(confirmShown === false){
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "CONFIRM NOT SHOWN"})
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }
        
        //double confirm
        let { isValid, msg: doubleConfirmErrMsg } = await this.doubleConfirm({ device, transAccData, appiumClient })
        if (isValid === false) {

            //click cancel btn
            await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.CONFIRM_CANCEL_BTN)).click()
            await tools.delay(1000)
            await deviceTools.clickBack({ device, count: 2, delay: 1000 })

            let errMsg = doubleConfirmErrMsg
            transStatus.failed996({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click ok
        await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.CONFIRM_OK_BTN)).click()
        await tools.delay(2000)


        //input pin
        let pinCol = await appiumClient.$(locator.PIN_DIALOG.INPUT_COL)
        await tools.delay(1000)
        await pinCol.sendKeys(transAccData.PIN.split(""))
        await tools.delay(500)

        //click ok
        await (await appiumClient.$(locator.PIN_DIALOG.OK_BTN)).click()
        await tools.delay(2000)

        transAccData.Status = Status.FINISHING_INTERNAL_TRANSACTION
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn: isSuccess } = await this.checkTransferSuccess({ appiumClient, retry: 12 })
        if (isSuccess === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "FAILED FINISHING TRANSACTION"})
            transStatus.failed997({ transAccData, statusDesc: errMsg, errMsg })
            throw { message: errMsg, expected: true }
        }

        transAccData.Status = Status.TRANSFER_INTERNAL_BENEFICIARY_SUCCESS
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })
        await tools.saveTransSlip({ device, transAccData })
        await (await appiumClient.$(locator.DIALOG_SH.OK_BTN)).click()
        await tools.delay(1500)

        //click to dashboard
        await (await appiumClient.$(locator.HOME_BTN)).click()
        await tools.delay(1000)
    }
    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async getBalance({ _device, transAccData, appiumClient }) {
        transAccData.Status = Status.GET_BALANCE
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc, sendBo: true })

        let { isIn } = await this.checkIsInDashboardPage({ appiumClient, retry: 5 })
        if (isIn === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "GET BALANCE NOT IN DASHBOARD PAGE"})
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click m-info
        await (await appiumClient.$(locator.DASHBOARD_PAGE.M_INFO_ICON)).click()
        await tools.delay(1000)

        let { isIn: inMInfo } = await this.checkIsInMInfoPage({ appiumClient , retry: 5})
        if (inMInfo === false) {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "GET BALANCE NOT IN M-INFO PAGE"})
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }

        //click info saldo
        await (await appiumClient.$(locator.M_INFO_PAGE.INFO_SALDO_BTN)).click()
        await tools.delay(3000)


        let balanceTag = await appiumClient.$(locator.M_INFO_PAGE.BALANCE)

        let balance = await balanceTag.getText()

        // 6.500,00
        console.debug("ORI BALANCE TXT: ", balance)
        let { success, val } = tools.parseBalanceString(balance)

        balance = success ? val : 0
        console.debug("BALANCE: ", balance)

        if (success === true) {
            transAccData.LastBalance = balance

            transAccData.Status = Status.GET_BALANCE_SUCCESS
            transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc })

            //click ok
            await (await appiumClient.$(locator.M_INFO_PAGE.OK_BTN)).click()

            let homeIcon = await appiumClient.$(locator.HOME_BTN)
            await homeIcon.click()
            await tools.delay(1200)
        } else {
            let {msg: errMsg} = await this.hasDialogMsg({appiumClient, defMsg: "GET BALANCE PARSING FAILED"})
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }
    }
    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async deleteInternalBeneficiary({ _device, transAccData, appiumClient }) {
        
        transAccData.Status = Status.DELETE_BENEFICIARY
        transStatus.saveTrans002({ transAccData, statusDesc: transAccData.Status.desc})
        
        //click m-Admin
        await (await appiumClient.$(locator.DASHBOARD_PAGE.M_ADMIN_ICON)).click()
        await tools.delay(1000)
        //swipe
        await appiumClient.$(locator.M_ADMIN_PAGE.SCROLL_TO_HAPUS_DAFTAR)

        //check indicator
        let { isIn: isGreen } = await this.checkIndicatorIsGreen({ appiumClient, retry: 5 })
        if (isGreen === false) {
            let errMsg = `${transAccData.Status.desc} INDICATOR NOT GREEN`
            transStatus.errorAfterSuccess({ transAccData, errMsg })
            throw { message: errMsg, expected: true }
        }
        
        //click hapus daftar
        await (await appiumClient.$(locator.M_ADMIN_PAGE.HAPUS_DAFTAR_BTN)).click()
        
        await tools.delay(2000)

        let {isIn: hasAccToBeDeleteted} = await this.checkHasAccToBeDeleted({appiumClient})
        if(hasAccToBeDeleteted === false){
            
            //back to dashboard
            await (await appiumClient.$(locator.HOME_BTN)).click()
            await tools.delay(1000)
            return
        }
        // centang 5
        let centangs = await appiumClient.$$(locator.M_ADMIN_PAGE.CENTANGS) 
        let max = centangs.length > 5 ? 5 : centangs.length
        for (let idx = 0; idx < max; idx++) {
            let centang = centangs[idx]
            await centang.click()
            await tools.delay(300)
        }

        //click delete
        await (await appiumClient.$(locator.M_ADMIN_PAGE.DELETE_BTN)).click()
        await tools.delay(2000)
        
        //click ok btn
        await (await appiumClient.$(locator.DIALOG_SH.OK_BTN)).click()
        await tools.delay(2000)
        
        //input pin
        let pinCol = await appiumClient.$(locator.PIN_DIALOG.INPUT_COL)
        await tools.delay(1000)
        await pinCol.sendKeys(transAccData.PIN.split(""))
        await tools.delay(500)
        //click ok
        await (await appiumClient.$(locator.PIN_DIALOG.OK_BTN)).click()
        await tools.delay(2000)
        
        //click ok sukses
        await (await appiumClient.$(locator.DIALOG_SH.OK_BTN)).click()
        await tools.delay(2000)
       
        //back to dashboard
        await (await appiumClient.$(locator.HOME_BTN)).click()
        await tools.delay(1000)

    }
    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async logOut({ device, _transAccData, appiumClient }) {
        await deviceTools.clickBack({device})
        await tools.delay(1000)
        
        //click logout
        await (await appiumClient.$(locator.DASHBOARD_PAGE.POPUP_LOGOUT_BTN)).click()
        await tools.delay(1000)

    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInWelcomePage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.WELCOME_PAGE.GANTI_KODE_AKSES, appiumClient, retry, interval })
        let found2 = await this.checkElementFound({ locatorStr: locator.WELCOME_PAGE.BUKA_REK_BARU, appiumClient, retry, interval })
        return { isIn: (found && found2), msg: "" }
    }


    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkKodeAksesShown({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.WELCOME_PAGE.KODE_AKSES_TEXT, appiumClient, retry, interval })
        return ({ isIn: found, msg: "" })
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInDashboardPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.M_ADMIN_ICON, appiumClient, retry, interval })
        let found2 = await this.checkElementFound({ locatorStr: locator.DASHBOARD_PAGE.M_TRANSFER_ICON, appiumClient, retry, interval })
        return { isIn: (found && found2), msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInMTransferPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.M_TRANSFER_PAGE.PAGE_TITLE, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInRegisterNameResultPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.M_TRANSFER_PAGE.ACC_NAME_FIELD, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkNameRegistedSuccess({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.M_TRANSFER_PAGE.SUCCESS_DIALOG, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInInputTransInfoPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_TRANS_INFO_PAGE.DARI_REK_TEXT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInConfirmPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.INPUT_TRANS_INFO_PAGE.CONFIRM_CONTENT, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{device: Device, transAccData: TransAccData, appiumClient: Browser}}  
     */
    async doubleConfirm({ _device, transAccData, appiumClient }) {

        let contentText = await (await appiumClient.$(locator.INPUT_TRANS_INFO_PAGE.CONFIRM_CONTENT)).getText()


        let strAmt = transAccData.Amount.toLocaleString('en', {minimumFractionDigits: 2}) // Rp 10,000.00
        let reqAcc = transAccData.BeneficiaryAcc
        let matchRegAmt = new RegExp(`\\D${strAmt}$`,'gm').test(contentText)
        let matchRegAcc = new RegExp(`${reqAcc}$`,'gm').test(contentText)

        if (matchRegAmt && matchRegAcc) {
            return { isValid: true, msg: "" }
        } else {
            let msg = `INVALID CONFIRM: ${reqAcc} ,trsf ${strAmt} != ${contentText}`

            return { isValid: false, msg }
        }

    }
    
    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIsInMInfoPage({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.M_INFO_PAGE.PAGE_TITLE, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkTransferSuccess({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.DIALOG_SH.MESSAGE_FIELD, appiumClient, retry, interval })
        let success = false
        if (found) {
            let msg = await (await appiumClient.$(locator.DIALOG_SH.MESSAGE_FIELD)).getText()
            if (msg.includes("BERHASIL")) {
                success = true
            }
        }
        return { isIn: success, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkIndicatorIsGreen({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.INDICATOR.GREEN, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }

    /**
     * @param {{appiumClient: Browser, retry: Number, interval: Number}}  
     */
    async checkHasAccToBeDeleted({ appiumClient, retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.M_ADMIN_PAGE.CENTANGS, appiumClient, retry, interval })
        return { isIn: found, msg: "" }
    }
    /**
     * @param {{appiumClient: Browser, defMsg: String, retry: Number, interval: Number}}  
     */
    async hasDialogMsg({ appiumClient, defMsg= "", retry = 2, interval = 1000 }) {
        let found = await this.checkElementFound({ locatorStr: locator.DIALOG_ERROR, appiumClient, retry, interval })
        let msg = ""
        if (found) {
            msg = await (await appiumClient.$(locator.DIALOG_ERROR)).getText()
        }else{
            msg = defMsg
        }
        return { isIn: found, msg  }
    }

    /**
     * @param {{locatorStr: String, appiumClient: Browser, retry: Number, interval: Number}} 
     */
    async checkElementFound({ locatorStr, appiumClient, retry = 2, interval = 1000 }) {
        let found = await (await appiumClient.$(locatorStr)).isDisplayed().catch(_err => { return false })

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

export { BCA }