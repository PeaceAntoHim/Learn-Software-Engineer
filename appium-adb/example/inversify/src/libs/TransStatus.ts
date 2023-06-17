import { msgLogger } from './MsgLogger.js';
// import {got} from 'got.js';
import { configApp } from '../configs/ConfigApp.js';
import { sqlDb } from '../SqlDb.js';
import { tools } from './Tools.js';
import { TTransAccData, TTransProcessStatus } from '../types/templateService.js';


// /**
//  * @typedef {import('../libs/TypeDef').TransAccData} TransAccData
//  * @typedef {import('../libs/TypeDef').TransProcessStatus} TransProcessStatus
//  */

class TransStatus {
    // constructor() {

    // }
    async getCompleteByTransactionID(transactionID) {
        const stmt = sqlDb.db.prepare("SELECT * FROM trans_status WHERE transaction_id = ? ORDER BY request_at ASC, inserted_at ASC")
        const rows = stmt.all(transactionID)
        let datas = rows.map((val) => {
            val.inserted_at = tools.parseUTCtoLocal(val.inserted_at)
            val.updated_at = tools.parseUTCtoLocal(val.updated_at)
            val.request_at = tools.parseUTCtoLocal(val.request_at)
            return val
        })
        return datas
    }
    /**
     * 
     * @param {{transAccData: TTransAccData, transProcessStatus: TTransProcessStatus, errMsg: String}}  
     */
    async saveTransStatus({ transAccData, transProcessStatus, errMsg = "" }: { transAccData: TTransAccData; appResultCode: string; transProcessStatus: TTransProcessStatus; errMsg: string; }) {
        try {
            const stmt = sqlDb.db.prepare("INSERT INTO trans_status VALUES (@transaction_id, @app_result_code, @status_desc, @machine_status, @last_balance, @bank_fee, @err_msg, @status_read, @request_at, @inserted_at, @updated_at)")
            stmt.run({
                transaction_id: transAccData.TransactionID,
                app_result_code: transProcessStatus.appResultCode,
                status_desc: transProcessStatus.statusDesc,
                machine_status: transProcessStatus.machineStatus,
                last_balance: transAccData.LastBalance,
                bank_fee: transAccData.BankFee,
                err_msg: errMsg,
                status_read: "N",
                request_at: transAccData.RequestAt.toISOString(),
                inserted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        } catch (err) {
            let errMsg = String(err.message || err)
            msgLogger.logTrans({event: "SAVE_STATUS_ERROR", data: {transAccData, transProcessStatus, errMsg}})
            // throw err
        }
    }
    /**
     * 
     * @param {{appResultCode: String, statusDesc: String}}  
     * @returns {{appResultCode: string, machineStatus: String, statusDesc: String}}
     */
    getTransStatus({appResultCode, statusDesc= ""}: { appResultCode: string; statusDesc: string; }): { appResultCode: string, machineStatus: string; statusDesc: string; }{
        let machineStatus = ""
        switch (appResultCode) {
            case "000":
                machineStatus = "INTERNAL_PROCESS"
                break;
            case "001":
                machineStatus = "SUCCESS"
                break;
            case "002":
                machineStatus = "PROCESSING"
                break;
            case "995":
                machineStatus = "OFFLINE"
                break;
            case "998":
                statusDesc = "Transaction can't be processed"
            // eslint-disable-next-line no-fallthrough
            case "996":
            case "997": // Danger
                machineStatus = "VERIFYING"
                break;
            case "999":
                statusDesc = "Internal Error"
                machineStatus = "INTERNAL_ERROR"
                break;
            default:
                break;
        }
        statusDesc = tools.normalizeDesc(statusDesc)
        return {appResultCode, machineStatus, statusDesc}
        
    }

    /** @param {{transAccData: TTransAccData, statusDesc: string, errMsg: String}} */
    async saveTrans001({ transAccData, statusDesc = "SUCCESS", errMsg = "" }: { transAccData: TTransAccData;  statusDesc?: string; errMsg?: string; }) {
        let appResultCode = "001"
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        this.sendToBO({ transAccData, transProcessStatus })
    }
    /** @param {{transAccData: TTransAccData, statusDesc: string, sendBo: boolean, errMsg: String}} */
    async saveTrans002({ transAccData, statusDesc, sendBo = false, errMsg = "" }: { transAccData: TTransAccData; statusDesc: string; sendBo?: boolean; errMsg?: string; }) {
        let appResultCode = "002"
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        if (sendBo === true) {
            this.sendToBO({ transAccData, transProcessStatus })
        }
    }
    /** @param {{transAccData: TTransAccData, statusDesc: string, errMsg: string}} */
    async errorAfterSuccess({ transAccData, statusDesc = "SUCCESS", errMsg = "" }: { transAccData: TTransAccData; statusDesc?: string; errMsg?: string; }) {
        let appResultCode = "001"
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        this.sendToBO({ transAccData, transProcessStatus })
    }
    /** @param {{transAccData: TTransAccData, statusDesc: string, errMsg: string}} */
    async failed996({ transAccData, statusDesc, errMsg = "" }: { transAccData: TTransAccData; statusDesc: string; errMsg: string; }) {
        let appResultCode = "996"
        statusDesc = statusDesc.replace(/\\r|\r|\n/g, " ")
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        this.sendToBO({ transAccData, transProcessStatus })
    }
    /** @param {{transAccData: TTransAccData, statusDesc: string, errMsg: string}} */
    async failed997({ transAccData, statusDesc, errMsg = ""  }: { transAccData: TTransAccData; statusDesc: string; errMsg: string; }) {
        let appResultCode = "997"
        statusDesc = statusDesc.replace(/\\r|\r|\n/g, " ")
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        this.sendToBO({ transAccData, transProcessStatus })
    }
    /** @param {{transAccData: TTransAccData, errMsg: string}} */
    async failed998({ transAccData, errMsg }: { transAccData: TTransAccData; errMsg: string; }) {
        let appResultCode = "998"
        let transProcessStatus = this.getTransStatus({ appResultCode, statusDesc: "" })
        this.saveTransStatus({transAccData, appResultCode, transProcessStatus, errMsg})
        msgLogger.logTrans({event: transAccData.Status.desc , data: {transAccData, errMsg}})
        this.sendToBO({ transAccData, transProcessStatus })
    }

    /** @param {{transAccData: TTransAccData, transProcessStatus: TTransProcessStatus}} */
    async sendToBO({ transAccData, transProcessStatus }: { transAccData: TTransAccData; transProcessStatus: TTransProcessStatus; }) {
        let transServerURL = configApp.transServer.host + configApp.transServer.apiPath
        if (transAccData.MachineID.includes("KURAS")) {
            transServerURL = configApp.transServer.host + configApp.transServer.apiKurasPath
        }
        let lastBalance = (transAccData.LastBalance < 0)? 0 : transAccData.LastBalance
        let jsonData = {
            MachineID: transAccData.MachineID,
            MerchantID: transAccData.MerchantID,
            SessionId: transAccData.SessionID,
            TransactionID: transAccData.TransactionID,
            Currency: transAccData.Currency,
            BankAccountCode: transAccData.BankAccountCode,
            AppResultCode: transProcessStatus.appResultCode,
            MachineStatus: transProcessStatus.machineStatus,
            StatusDescription: transProcessStatus.statusDesc,
            LastBalance: tools.toNumericString(lastBalance),
            BankFee: tools.toNumericString(transAccData.BankFee)
        }
        try {
            msgLogger.logTrans({ event: "SEND_TO_SERVER", data: {jsonData, transAccData, transServerURL} })

            type tRes = {
               body: {
                  ResultCode: number,
               },
            }
            // const response: tRes = await got.post(transServerURL, {
            //     json: jsonData,
            //     responseType: 'json',
            //     retry: {
            //         limit: 0
            //     },
            //     timeout: {
            //         request: 10000
            //     }
            // })

            // console.debug(response.body)
            // if (response.body.ResultCode != 1) {
            //     console.debug("Send Trans Server Failed jsonData: ", jsonData, " response: ", response.body)
            //     msgLogger.logTrans({ event: "SEND_TO_SERVER_FAILED", data: { jsonData, transServerURL, errMsg: response.body } })
            // } else {
            //     msgLogger.logTrans({ event: "SEND_TO_SERVER_SUCCESS", data: { jsonData, transServerURL } })
            // }
        } catch (err) {
            let errMsg = (err.response) ? err.response.body : String(err.message || err)
            msgLogger.logTrans({ event: "SEND_TO_SERVER_ERROR", data: { jsonData, transServerURL, errMsg } })
        }
    }
}
let transStatus = new TransStatus()
export { transStatus }
