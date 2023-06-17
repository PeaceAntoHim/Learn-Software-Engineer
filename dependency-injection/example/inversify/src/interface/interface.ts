export interface IBankService {
   components(): Record<string, string>,
   logic(): string
}

export interface IService {
   getServiceBankComponents(): Record<string, string>,
   getServiceBankLogic(): string
}

export interface IInput {
   getInputFromCommandLine(prompt:string): Promise<string>
}