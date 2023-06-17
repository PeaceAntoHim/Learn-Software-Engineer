export interface IAppService {
   launchTest(): void
}

export interface IInput {
   getInputFromCommandLine(prompt:string): Promise<string>
}

export interface IService {
   getServiceTest(): void
}