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
   /**
    * This method to run shell and open authy application
    */
   async runShellAuthy() {
      // const adb = await ADB.createADB();
      
      this._adb.shell('am start -n com.authy.authy/com.authy.authy.activities.InitializationActivity')
   }
   
    /**
    * This method to run shell and open Github application
    */
   async runShellGithub() {
      // const adb = await ADB.createADB();
      // console.log(await adb.getPIDsByName("com.android.phone"));
      this._adb.shell('am start -n com.github.android/com.github.android.activities.MainActivity')
   }
   async runShellTabular() {
      // const adb = await ADB.createADB();
      // console.log(await adb.getPIDsByName("com.android.phone"));
      this._adb.shell('am start -n com.swific.registerbook.MainActivity -c android.intent.category.LAUNCHER 1')
   }

   async runShellBCA() {
      this._adb.shell('monkey -p com.bca -c android.intent.category.LAUNCHER 1')
   }

   async runShellBRI() {
      this._adb.shell('monkey -p id.co.bri.brimo -c android.intent.category.LAUNCHER 1')
   }

   async runShellBNI() {
      this._adb.shell('monkey -p  src.com.bni android.intent.category.LAUNCHER 1')
   }
}