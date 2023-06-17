import { Container } from "inversify"
import { TService } from "../types/templateService"
import { IService, IBankService } from "../interface/interface"
import { SelectService } from "../core/selectService"
import { BCAService } from "../services/BCA"
import { BNIService } from "../services/BNI"
import { BRIService } from "../services/BRI"
import { SEAService } from "../services/SEA"

const serviceContainer = new Container()

serviceContainer.bind<IService>(TService.IService).to(SelectService)
// serviceContainer.bind<IBankService>(TService.IBankService).to(BCAService)
// serviceContainer.bind<IBankService>(TService.IBankService).to(BNIService)
// serviceContainer.bind<IBankService>(TService.IBankService).to(BRIService)
serviceContainer.bind<IBankService>(TService.IBankService).to(SEAService)

const service = serviceContainer.get<IService>(TService.IService)
const bank = serviceContainer.get<IBankService>(TService.IBankService)


console.log(service.getServiceBankComponents())
console.log(service.getServiceBankLogic())

// console.log(bank.components())
