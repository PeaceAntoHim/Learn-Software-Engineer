import { config } from "../config/config";
import { IInput } from "../interface/interface";
import * as readline from 'readline';

export class Input implements IInput {
   private async getServiceName(prompt: string): Promise<string> {
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

   public async getInputFromCommandLine() : Promise<string>{
      const keyOfObj = Object.keys(config)
      let nameOfService = await this.getServiceName('Pick one of this service: \n 1. BCA \n 2. BNI \n 3. BRI \n 4. SEA \n\n') as string;

      
      while(!keyOfObj.includes(nameOfService)) {
        nameOfService = await this.getServiceName('\n\nService you pick undefind please select the right one: \n 1. BCA \n 2. BNI \n 3. BRI \n 4. SEA \n\n') as string
      }
      return nameOfService
   }
}