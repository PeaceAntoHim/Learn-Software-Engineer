import { configService } from "../configs/configService";
import { IInput } from "../interfaces/IInput";
import * as readline from 'readline';

export class Input implements IInput {

  /** 
   * This method to list all name of service want to automated from cmd/bash
   * @param prompt
   * @return {Promise<string>}
   * 
  */
   private async listServiceName(prompt: string): Promise<string> {
      const rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout
       });
     
       return new Promise<string>((resolve) => {
         rl.question(prompt, (input) => {
           rl.close();
           resolve(input);
         });
       });
   }

  /** 
   * This method to get input from client side from cmd to select service wants use
   * @return {string}
   * 
  */
   public async getServiceName() : Promise<string>{
      const keyOfObj = Object.keys(configService)
      let nameOfService = await this.listServiceName('Pick one of this service: \n 1. Github \n 2. Tabular \n 3.BCA \n 4.BRI \n\n') as string;

      while(!keyOfObj.includes(nameOfService)) {
        nameOfService = await this.listServiceName('\n\nService you pick undefind please select the right one: \n 1. Github \n 2. Tabular \n 3.BCA \n 4.BRI \n\n') as string
      }
      return nameOfService
   }
}