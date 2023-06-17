import {pino} from "pino"
import {configApp} from "../configs/ConfigApp.js";
import * as OS from "os";
import { tools } from "./Tools.js";

class MsgLogger {
    hostname: string;
    logger: pino.Logger;
    
    constructor() {
        this.hostname = configApp.hostname || OS.hostname()
        this.logger = pino({ level: configApp.logLevel.level })
    }

    debug(data){
        this.logger.debug(data)
    }
    logTrans({event, data}) {
        // data = this.parseDataUtcToLocal(data)
        this.logger.debug({ context: "TRANS", event, data})
    }

    logConfirmLogin({event, data}) {
        // data = this.parseDataUtcToLocal(data)
        this.logger.debug({ context: "CONFIRM_LOGIN", event, data})
    }

    logSmartOTP({event, data}){
        this.logger.debug({context: "SMART_OTP", event, data})
    }
    logVtnOTP({event, data}){
        let fullEvent = `REQ_VTN_${event}`
        this.logger.debug({context: "SMART_OTP", event: fullEvent, data})
    }

    logBidvOTP({event, data}){
        let fullEvent = `REQ_BIDV_${event}`
        this.logger.debug({context: "SMART_OTP", event: fullEvent, data})
    }

    logScbMConnected({event, data}){
        let fullEvent = `REQ_SCB_MCONNECTED_${event}`
        this.logger.debug({context: "SMART_OTP", event: fullEvent, data})
    }
    
    logSmsOTP({event, data}){
        this.logger.debug({context: "SMS_OTP", event, data}) 
    }


    logFilterMutation({event, data}){
        this.logger.debug({context: "MUTATION", event, data})
    }
    logReqRemoting(event, data){
        this.logger.debug({ context: "REMOTING", event, data})
    }

    parseDataUtcToLocal(data) {
        if (data.accData && data.accData.RequestAt) {
            let requestAt = tools.parseUTCtoLocal(data.accData.RequestAt)
            data.accData.RequestAt = requestAt
        }
        if (data.transAccData && data.transAccData.RequestAt) {
            let requestAt = tools.parseUTCtoLocal(data.transAccData.RequestAt)
            data.transAccData.RequestAt = requestAt
        }
        if (data.status && data.status.requestAt) {
            let requestAt = tools.parseUTCtoLocal(data.status.requestAt)
            data.status.requestAt = requestAt
        }
        if (data.requestAt) {
            let requestAt = tools.parseUTCtoLocal(data.requestAt)
            data.requestAt = requestAt
        }
        return data

    }
}

let msgLogger = new MsgLogger()
export { msgLogger }