import {ADB} from 'appium-adb';

export class AppiumADB {
    runAdbAuthy = async () => {
      const adb = await ADB.createADB();
      console.log(await adb.getPIDsByName('com.android.phone'));
      adb.shell('am start -n com.authy.authy/com.authy.authy.activities.InitializationActivity')
   }
   
    runAdbGithub = async () => {
      const adb = await ADB.createADB();
      console.log(await adb.getPIDsByName('com.android.phone'));
      adb.shell('am start -n com.github.android/com.github.android.activities.MainActivity')
   }
}