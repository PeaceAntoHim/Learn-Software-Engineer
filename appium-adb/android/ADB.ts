import {ADB} from 'appium-adb';

const runAdbAuthy = async () => {
   const adb = await ADB.createADB();
   console.log(await adb.getPIDsByName('com.android.phone'));
   adb.shell('am start -n com.authy.authy/com.authy.authy.activities.InitializationActivity')
}

const runAdbGithub = async () => {
   const adb = await ADB.createADB();
   console.log(await adb.getPIDsByName('com.android.phone'));
   adb.shell('am start -n com.github.android/com.github.android.activities.MainActivity')
}

const runAdbExcel = async () => {
   const adb = await ADB.createADB();
   console.log(await adb.getPIDsByName('com.android.phone'))
   adb.shell('am start -n com.microsoft.office.excel/com.microsoft.office.excel.excelMainActivity')
}

export {runAdbAuthy, runAdbGithub, runAdbExcel}