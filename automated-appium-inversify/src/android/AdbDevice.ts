import {ADB} from 'appium-adb';


export class AdbDevice {
   private _adb!: ADB;
   
   constructor() {
      (async() => {
         this._adb = await ADB.createADB()
         this._adb
         console.log(await this._adb.getPIDsByName("com.android.phone"));
      })()
   }

   async runShellBCA() {
      this._adb.shell('monkey -p com.bca -c android.intent.category.LAUNCHER 1')
   }

   async runShellBRI() {
      this._adb.shell('monkey -p id.co.bri.brimo -c android.intent.category.LAUNCHER 1')
   }

   async runShellBNI() {
      this._adb.shell('monkey -p src.com.bni android.intent.category.LAUNCHER 1')
   }
}