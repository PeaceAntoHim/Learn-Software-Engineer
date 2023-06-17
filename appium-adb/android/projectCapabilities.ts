import { RemoteOptions } from "webdriverio";

class ProjectCapabilities {
  static webDriverPath: string = '/wd/hub';
  static webDriverPort: number = 4723;
//  appPackage= "com.android.contacts", appActivity = "com.android.contacts.activities.PeopleActivity, "
 static githubBaseCapabilities(appPackage= "com.github.android", appActivity = "com.github.android.activities.MainActivity") : RemoteOptions {
 const desiredCapabilities = {
   platformName: "Android",
   deviceName: "franonym_code",
   appPackage: appPackage,//com.android.calculator
   appActivity: appActivity,//com.android.calculator2.Calculator
   automationName: "UiAutomator2",
  //  ...additionalCaps
  };
 return {
  //  host: this.webDriverHost,
   path: this.webDriverPath,
   port: this.webDriverPort,
   capabilities: desiredCapabilities
  }
 }

 static tabularBaseCapabilities(
  appPackage= "com.swific.registerbook", appActivity= "com.swific.registerbook.MainActivity",
 ) : RemoteOptions {
  const desiredCapabilities = {
    platformName: "Android",
    deviceName: "franonym_code",
    appPackage: appPackage,//com.android.calculator
    appActivity: appActivity,//com.android.calculator2.Calculator
    automationName: "UiAutomator2",
   //  ...additionalCaps
   };
  return {
   //  host: this.webDriverHost,
    path: this.webDriverPath,
    port: this.webDriverPort,
    capabilities: desiredCapabilities
   }
 }
}
export default ProjectCapabilities;