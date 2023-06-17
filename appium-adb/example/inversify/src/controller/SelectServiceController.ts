import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IBankService, IService } from "../interface/interface.js";
import { TAppiumServer, TDevice, TService, TTransAccData } from "../types/templateService.js";
import { AppiumManager } from "../appium/AppiumManager.js";
import { DeviceManager } from "../android/DeviceManager.js";
import { msgLogger } from "../libs/MsgLogger.js";
import { tools } from "../libs/Tools.js";
import PQueue from "p-queue";
import PriorityQueue from "p-queue"
import QueueAddOptions from "p-queue"


// let tasks = new Map();
@injectable()
export class SelectService implements IService {
   private _serviceBank: IBankService
   private _appiumManager: AppiumManager
   private _deviceManager: DeviceManager
   private _transAccData: TTransAccData
   private _device: TDevice
   private _server: TAppiumServer
   

   constructor(
      @inject(TService.IBankService) serviceBank: IBankService,
      @inject(TService.IDeviceManager) deviceManager: DeviceManager,
      @inject(TService.IAppiumManager) appiumManager: AppiumManager
   ) {      
      this._serviceBank = serviceBank
      this._deviceManager = deviceManager
      this._appiumManager = appiumManager
      this._transAccData = {
         DeviceId: '192.168.20.139:44417', //192.168.20.139:33995 //3045057923000JU
         DeviceModel: "V2050", //sdk_gphone64_x86_64
         BankCode: "BCA",
         BankAccountCode: "",
         BankAccountNo: "6821414455",
         UserId: "",
         AppPassword: "abc123",
         PIN: "888888",
         BeneficiaryBankCode: "BCA",
         BeneficiaryName: "Ferdian Sanjaya",
         BeneficiaryAcc: "5735388948",
         Amount: 10000,
         Remark: "grab",
         IgnoreByName: "N",
         Currency: "IDR",
         TransactionID: "bca_283_151",
         MachineID: "SUNTIE17",
         MerchantID: "merchantId",
         SessionID: "sessionId"
      }

   }

   async getServiceBankLogic() {
      try {
         let deviceQueue = await this._deviceManager.getDeviceQueueByDeviceId(this._transAccData.DeviceId)
         let priority = 0
         let device = await this._deviceManager.getDeviceById({deviceId: this._transAccData.DeviceId})
         let transAccData = this._transAccData

         await deviceQueue.add(async () => {
            try {
               let server = await this._appiumManager.assignServerToDeviceId(device.id)
               console.log(`this server: ${server}`)
               await this._serviceBank.getBankLogic().processTransferReq({device, server, transAccData})
            } catch (err) {
               msgLogger.logTrans({event: "TRANS_PROCESS_FAILED", data: { reqIP: "req.ip", accData: transAccData, err: String(err) }})
            }
            finally {
               //   tasks.delete(taskKey)
               console.log("tasks delete req")
            }
         }, { priority: priority })        
      } catch (e) {
         console.log("error " + e)
      }
   }
}
