import { Image } from "image-js";
import { deviceTools } from "../android/DeviceTools.js";
import { spawn, spawnSync } from "child_process";
import  QRCode  from "qrcode";
/**
 * @typedef {import("./TypeDef").TransAccData} TransAccData
 * @typedef {import("./TypeDef").AccData} AccData
 * @typedef {import("@u4/adbkit").Device} Device
 */
class Tools {
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    /**
     * 
     * @param {*} reqBody 
     * @returns {Promise<TransAccData>}
     */
    parseTransAccDataReqBody(reqBody) {
        let { DeviceId, DeviceModel,
            UserId, AppPassword, PIN, BankCode,
            BankAccountCode,
            BankAccountNo,
            BeneficiaryBankCode, BeneficiaryName, BeneficiaryAcc,
            Amount, Remark, IgnoreByName, Currency,
            MachineID, MerchantID, SessionID, TransactionID } = reqBody
        return new Promise((resolve, reject) => {

            let wrongParam = ""
            if (!DeviceId) {
                wrongParam = "DeviceId"
            } else if (!BankCode) {
                wrongParam = "BankCode"
            } else if (!BankAccountNo) {
                wrongParam = "BankAccountNo"
            } else if (!TransactionID) {
                wrongParam = "TransactionID"
            } else if (!BeneficiaryBankCode) {
                wrongParam = "BeneficiaryBankCode"
            } else if (!["Y", "N"].includes(IgnoreByName)) {
                wrongParam = "IgnoreByName is Y or N only"
            }

            // if (!Number.isInteger(Amount) || (Number.isInteger(Amount) && Amount <= 0)) {
            //     wrongParam = `Invalid Amount ${Amount}`
            // }
            Amount = Number(Amount)
            if (Remark.length > 32) {
                wrongParam = "Remark's max limit 32 chars"
            }
            if (wrongParam) return reject(`Invalid Params: ${wrongParam}`)

            let body = {
                DeviceId: DeviceId,
                DeviceModel: DeviceModel,
                BankCode: BankCode,
                BankAccountCode: BankAccountCode,
                BankAccountNo: BankAccountNo,
                UserId: UserId,
                AppPassword: AppPassword,
                PIN: PIN,
                BeneficiaryBankCode: BeneficiaryBankCode,
                BeneficiaryName: BeneficiaryName,
                BeneficiaryAcc: BeneficiaryAcc,
                Amount: Amount,
                Remark: Remark,
                IgnoreByName: IgnoreByName,
                Currency: Currency,
                MachineID: MachineID,
                MerchantID: MerchantID,
                SessionID: SessionID,
                TransactionID: TransactionID,
                LastBalance: 0, // add default balance
                BankFee: 0, //add default BankFee
                RequestAt: new Date(),// add request_at date
                Status: { desc: "", step: 0 }, // add def status 
                IsInternalTransfer: false  // add def internalTransfer status
            }
            resolve(body)
        })
    }
    /**
     * 
     * @param {*} reqBody 
     * @returns {Promise<AccData>}
     */
    parseAccDataReqBody(reqBody) {


        let { DeviceId, DeviceModel,
            BankCode, Password, BankTXID, AccountNumber, SystemId, Mode, QrData } = reqBody

        return new Promise((resolve, reject) => {

            let wrongParam = ""
            if (!DeviceId) {
                wrongParam = "DeviceId"
            } else if (!BankCode) {
                wrongParam = "BankCode"
            }
            if (wrongParam) return reject(`Invalid Params: ${wrongParam}`)

            /**@type {AccData}} */
            let body = {
                DeviceId,
                DeviceModel,
                BankCode,
                Password,
                BankTXID,
                AccountNumber,
                SystemId,
                Mode,
                QrData,
                RequestAt: new Date(),// add request_at date
            }
            resolve(body)
        })
    }
    /**@param{string} dateStr*/
    parseUTCtoLocal(dateStr) {
        const date = new Date(dateStr)
        // console.debug("date by new: ", date) 
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // console.debug("tzoffset:",tzoffset)
        let localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);
        // console.debug("local ", localISOTime)
        return localISOTime
    }

    /**
     * 
     * @param {Number} pid 
     */
    pidIsRunning(pid) {
        try {
            return process.kill(pid, 0)
        } catch (e) {
            console.debug("pidIsRunning err code: ", e.code)
            return false
        }
    }
    /**
     * 
     * @param {Number} pid 
     */
    killPid(pid) {
        console.debug("kill pid: ", pid)
        try {
            return process.kill(pid)
        } catch (e) {
            console.debug("killPid err code: ", e.code)
            return false
        }
    }
    /**
 * 
 * @param {string} reqName 
 * @param {string} accName 
 * @param {string} ignoreByName 
 */
    validateAccName(reqName, accName, ignoreByName = "N") {
        let valid = ignoreByName === "Y";

        // let regex = /\d/gm // contains digit from incorrect ocr
        // if (!accName || accName == "INVALID" || regex.exec(accName)) {
        //     valid = false
        //     return valid
        // }

        if (!accName || accName == "INVALID") {
            valid = false
            return valid
        }
        accName = accName.trim()
        accName = accName.replace(/\|/gm, "I") // "|" -> "I"
        accName = accName.replace(/0/gm, "O") // "0" -> "O"
        reqName = reqName.toLowerCase()
        accName = accName.toLowerCase()
        accName = accName.replace(/bpk\s|ibu\s|sdri\s|sdra\s|sdr\s/gm, "")
        if (reqName == accName || reqName.replace(" ", "") == accName.replace(" ", "")) {
            valid = true;
        }
        return valid;
    }
    /**
 * see utils.test.js Verifying Decimal 
 * @param {*} oriBalance 
 * @returns {{success: Boolean, val: Number}} 
 */
    parseBalanceString(oriBalance) {

        let moneyStr = String(oriBalance)
        let delimiter = moneyStr.charAt(moneyStr.length - 3)
        let balance
        let arr
        if (delimiter === ".") {
            moneyStr = moneyStr.replace(/,/g, "")
            arr = moneyStr.split(".")
            if (arr.length > 0, arr[arr.length - 1].length === 2) {
                moneyStr = arr.reduce((prev, curr, idx) => {
                    let sep = (idx == arr.length - 1) ? "," : ".";
                    return prev + sep + curr;
                })
            }
            balance = moneyStr.replace(/\./g, "")
            balance = balance.replace(/,/g, ".")
        } else if (delimiter === ",") {
            arr = moneyStr.split(",")
            if (arr.length > 0, arr[arr.length - 1].length === 2) {
                moneyStr = arr.reduce((prev, curr, idx) => {
                    let sep = (idx == arr.length - 1) ? "," : ".";
                    return prev + sep + curr;
                })
            }
            balance = moneyStr.replace(/\./g, "")
            balance = balance.replace(/,/g, ".")
        } else {
            balance = moneyStr.replace(/\.|,/g, "")
        }
        //make sure no \n \r
        balance = balance.replace(/\\r|\r|\n|\\n/g, "")
        console.log(`oriVal: ${oriBalance}, formatted: ${balance}`)
        if (isNaN(balance * 1)) {
            return { success: false, val: 0 }
        } else {
            return { success: true, val: Number(balance) }

        }
    }

    toNumericString(val) {
        let numericStr: any = String(val)
        if (isNaN(numericStr * 1) === true) {
            return "0"
        } else {
            return numericStr
        }
    }
    /**
     * @param {string} text 
     * @param {{x: number, y: number, dx: number, dy: number}} keyPad 
    */
    tapsByKeypad(text, keyPad) {
        /* keypad maping
        [ 1 ] [ 2 ] [ 3 ]
        [ 4 ] [ 5 ] [ 6 ]
        [ 7 ] [ 8 ] [ 9 ]
              [ 0 ]
        */
        let taps = text.split('').map(e => {
            let col = e == 0 ? 1 : (e - 1) % 3
            let row = e == 0 ? 3 : Math.floor((e - 1) / 3)
            let x = keyPad.x + (keyPad.dx * col)
            let y = keyPad.y + (keyPad.dy * row)
            return { x, y }
        })
        return taps
    }


    /**
     * @param {{device: Device, transAccData: TransAccData, useFFmpeg: Boolean, folderPath: String}} param0 
     */
    async saveTransSlip({ device, transAccData, useFFmpeg = false, folderPath = "./slips/" }) {
        console.log("SAVING_SLIP")
        const date = new Date()
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        // let dateNow = new Date().toISOString().slice(0,10).replace(/-/g,"")
        // let dateNow = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10).replace(/-/g,"");
        let dateTimeNow = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 19).replace(/-/g, "").replace(/T/g, "_");

        let [dateNow, timeNow] = dateTimeNow.split("_")
        timeNow = timeNow.replace(/:/g, "_")

        /**@type {Image} */
        let img
        if (useFFmpeg === true) {
            let imageFile = await this.screenCapWithFFmpeg({ device })
            img = await Image.load(imageFile)
        } else {
            img = await this.screenCapWithRetry({ device })
        }

        // ./slips/IDR/BCA/S{YYYYMMDD}_{TRXID}.png
        // ./slips/VND/TCB/S{YYYYMMDD}_{TRXID}.png
        // let filename = `${pathFolderPrefix}${accData.Currency}/${accData.BankCode}/S${dateNow}_${timeNow}_${accData.TransactionID}.png`
        let filename = `${folderPath}${transAccData.Currency}/${transAccData.BankCode}/S-${transAccData.TransactionID}-${dateNow}-${timeNow}.png`

        img.save(filename)
            .then(() => {
                console.log(`SAVE_SLIP_SUCCESS: ${filename}`)
            }).catch(err => {
                let errMsg = String(err.message || err)
                console.log(`SAVE_SLIP_FAILED: ${filename}, err: ${errMsg}`)
            })

    }

    /**
 * 
 * @param {{device: Device, retry: Number, interval: Number}} 
 * @returns {Image}
 */
    async screenCapWithRetry({ device, retry = 5, interval = 1000 }) {
        let buff = await deviceTools.screencap({ device })
        if (buff && buff.length > 0) {
            let img = await Image.load(buff)
            return img
        } else {
            console.debug("buff empty")
            if (retry > 0) {
                await this.delay(interval)
                return await this.screenCapWithRetry({ device, retry: retry - 1, interval })
            }
            else {
                // return null
                throw "Empty buffer"
            }
        }
    }
    /**
 * 
 * @param {{device:Device}}
 */
    async screenCapWithFFmpeg({ device }) {
        console.debug("screencap with ffmpeg")
        let videofile = `./images/tmp_vid_${device.id}.mkv`
        let imagefile = `./images/tmp_ss_${device.id}.png`

        let scrcpyProcess = spawn("scrcpy", ["-s", device.id, "-b", "2M", "-Nr", `${videofile}`])
        await tools.delay(3000) // load some screen

        scrcpyProcess.kill()
        await tools.delay(1000)
        spawnSync("ffmpeg", ["-y", "-i", `${videofile}`, "-vframes", "1", `${imagefile}`])
        await tools.delay(1000)
        return imagefile

    }

    /**
        * @param {String} str 
        */
    normalizeDesc(str) {
        return str.replace(/[^a-z0-9\s.,']+/gi, "")
    }

    /**
     * 
     * @param {String} str 
     * @returns 
     */
    parseBase64(str){

        let buff = Buffer.from(str, 'base64');
        let text = buff.toString("utf-8");
       
        return text;
    }
    /**
     * 
     * @param {{stringData: String, opts: any}}  
     * @param {{any}} opts
     */
    async stringToQRBase64({stringData, opts = {version: 7, errorCorrectionLevel: "M"}}){
        return await QRCode.toDataURL(stringData, opts)
    }


}

let tools = new Tools()
export { tools }