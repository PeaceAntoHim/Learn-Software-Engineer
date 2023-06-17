import { config } from "../configs/config.js"

export const TService = {
   IBankService: Symbol.for("IBankService"),
   IService: Symbol.for("IService"),
   IAppiumManager: Symbol.for("IAppiumManager"),
   IDeviceManager: Symbol.for("IDeviceManager"),

}

export type TAccData = {
    DeviceId: string
    DeviceModel: string
    BankCode: string
    Password: string
    BankTXID: string
    AccountNumber: string
    SystemId: string
    Mode: string
    QrData: string
    RequestAt: Date
}

export type TAppiumServer = {
    port: number,
    pid: number,
    deviceId: string,
}

export type TTransAccData = {
    DeviceId: string
    DeviceModel: string
    BankCode: string
    BankAccountCode: string
    BankAccountNo: string
    UserId: string
    AppPassword: string
    PIN: string
    BeneficiaryBankCode: string
    BeneficiaryName: string
    BeneficiaryAcc: string
    Amount: number
    Remark: string
    IgnoreByName: string
    Currency: string
    MachineID: string
    MerchantID: string
    SessionID: string
    TransactionID: string
    LastBalance?: number
    BankFee?: number
    RequestAt?: Date
    Status?: {desc: string, step: number} 
    IsInternalTransfer?: boolean 
} 


export type TTransProcessStatus = {
    appResultCode: string
    machineStatus: string
    statusDesc: string
}

export type BankLogic = {
    proccesReq: (arg0: { device: TDevice; accData: TAccData; server: TAppiumServer} ) => any
}

export type TDevice = import("@u4/adbkit").Device

export type keyServices = keyof typeof config