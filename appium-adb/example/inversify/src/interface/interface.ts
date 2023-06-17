import { keyServices } from "../types/templateService.js";
import { config } from "../configs/config.js";
import { BCA } from "../core/BCA/BCA.js";
import { BNI } from "../core/BNI/BNI.js";
import { Mandiri } from "../core/MDR/Mandiri.js";
import { BRI } from "../core/BRI/BRI.js";


export interface IBankService {
   getBankLogic(): BCA | BNI | BRI | Mandiri
}

export interface IService {
   getServiceBankLogic(): void
}

export interface IInputService {
   getInputServiceFromCommandLine(prompt:string): Promise<string>
}