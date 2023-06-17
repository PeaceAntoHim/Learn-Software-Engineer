import { Logger } from "./Logger";

export class ConsoleLogger implements Logger { 
   public log(message: string): void {
      console.log(message);
   }
}