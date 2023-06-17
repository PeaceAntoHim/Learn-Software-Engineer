
import ProjectCapabilities from '../libs/projectCapabilities';
import { Browser, remote} from 'webdriverio'
import { getElement, getListElement, setValueOfElement, tapElement } from '../libs/utils'
import { AppiumADB} from '../libs/AppiumADB';
import { Authy, Github } from '../libs/app';
import { IAppService } from '../interface/interface';
import { describe, it, before, after } from 'mocha';

export class GithubService implements IAppService {
   // private _mocha = new Mocha()

  async launchTest() {   
      // mocha.run(() => {
      // this.run()
      // describe("Android Github App Test", function() {
      let driver: Browser;
      const _appiumADB = new AppiumADB()
      // this.timeout(40000) 
      let key: string
            const remoteOptions = ProjectCapabilities.githubBaseCapabilities()
            driver = await remote(remoteOptions)
         await tapElement(driver, `android=${Github.loginComponent.btnLogin}`);
            await setValueOfElement(
               driver,
               Github.loginComponent.username,
               "VizzedBuzzed",
               );
            await setValueOfElement(
               driver,
               Github.loginComponent.password,
               "@Vizzbuzzed123",
            );
            await tapElement(driver, Github.loginComponent.login);
            _appiumADB.runAdbAuthy()
            key = await getElement(
               driver,
               `android=${Authy.keyComponents.keyAuth}`,
            )
            console.log(`--> ${key.replace(/\s/g, '')}`)
            _appiumADB.runAdbGithub()
            await setValueOfElement(driver, Github.loginComponent.authentication, key.replace(/\s/g, ''))
            await tapElement(driver, Github.loginComponent.btnVerify)
            await tapElement(driver, Github.loginComponent.continue)
            await tapElement(driver, Github.loginComponent.clickHere)
            await tapElement(driver, `android=${Github.homeComponent.home}`)
            await tapElement(driver, Github.homeComponent.organization)
            await tapElement(driver, Github.homeComponent.realtech)
            await tapElement(driver, `android=${Github.homeComponent.organizationRepo}`)
            const listRepo = await getListElement(driver, `android=${Github.homeComponent.listRepo}`)
      
            console.log("--> " + listRepo)
            await tapElement(driver, `${Github.homeComponent.back}`)
            await tapElement(driver, `${Github.homeComponent.back}`)
            await tapElement(driver, `${Github.homeComponent.back}`)
         await tapElement(driver, `android=${Github.homeComponent.profileName}`)
            await tapElement(driver, `android=${Github.homeComponent.settings}`)
            await driver.touchAction([ {action: 'longPress', x: 1052, y: 1567}, { action: 'moveTo', x: 1041, y: 689}, 'release' ]);
            await tapElement(driver, `${Github.homeComponent.signOut}`)
            await tapElement(driver, `android=${Github.homeComponent.popUpSignOut}`)
     
   }
}


// export class GithubService {
//    // private _mocha = new Mocha()

//    launchTest() {   
//       // mocha.run(() => {
//       // this.run()
//       describe("Android Github App Test", function() {
//       let driver: Browser;
//       const _appiumADB = new AppiumADB()
//       this.timeout(40000) 
//       let key: string
//          before(async () => {
//             const remoteOptions = ProjectCapabilities.githubBaseCapabilities()
//             driver = await remote(remoteOptions)
//          });
//          it('Tap Button Login Github', async function (){
//          await tapElement(driver, `android=${Github.loginComponent.btnLogin}`);
//          });
//          it('Set Value Username Github', async () => {
//             await setValueOfElement(
//                driver,
//                Github.loginComponent.username,
//                "VizzedBuzzed",
//                );
//          })
//          it('Set Value Password Github', async () => {
//             await setValueOfElement(
//                driver,
//                Github.loginComponent.password,
//                "@Vizzbuzzed123",
//             );
//          })
//          it('Tap Github Webview Login Button', async () => {
//             await tapElement(driver, Github.loginComponent.login);
//          })
//          it('Open Authy App Use ADB', async () => {
//             _appiumADB.runAdbAuthy()
//             key = await getElement(
//                driver,
//                `android=${Authy.keyComponents.keyAuth}`,
//             )
//             console.log(`--> ${key.replace(/\s/g, '')}`)
//          })
//          it('Open Authy App Use ADB', async () => {
//             _appiumADB.runAdbGithub()
//          })
//          it('Set Value Key Authy', async () => {
//             await setValueOfElement(driver, Github.loginComponent.authentication, key.replace(/\s/g, ''))
//          })
//          it('Tap Button Verify Github', async () => {
//             await tapElement(driver, Github.loginComponent.btnVerify)
//          })
//          it('Tap Link Continue', async () => {
//             await tapElement(driver, Github.loginComponent.continue)
//          })
//          it('Tap Click Here', async () => {
//             await tapElement(driver, Github.loginComponent.clickHere)
//          })
//          it("Tap Github Home", async () => {
//             await tapElement(driver, `android=${Github.homeComponent.home}`)
//          })
//          it("Tap Icon Organization", async () => {
//             await tapElement(driver, Github.homeComponent.organization)
//          })
//          it("Tap Realtech Icon", async () => {
//             await tapElement(driver, Github.homeComponent.realtech)
//          })
//          it("Tap Organization Repo", async () => {
//             await tapElement(driver, `android=${Github.homeComponent.organizationRepo}`)
//          })
//          it("Log All List Repo", async () => {
//             const listRepo = await getListElement(driver, `android=${Github.homeComponent.listRepo}`)
      
//             console.log("--> " + listRepo)
//          })
//          it('Back from list repo', async () => {
//             await tapElement(driver, `${Github.homeComponent.back}`)
//          })
//          it('Back from realtechltd', async () => {
//             await tapElement(driver, `${Github.homeComponent.back}`)
//          })
//          it('Back from Organization', async () => {
//             await tapElement(driver, `${Github.homeComponent.back}`)
//          })
//          it('Tap Click User Profile', async () => {
//          await tapElement(driver, `android=${Github.homeComponent.profileName}`)
//          })
//          it('Tap Click Settings', async () => {
//             await tapElement(driver, `android=${Github.homeComponent.settings}`)
//             await driver.touchAction([ {action: 'longPress', x: 1052, y: 1567}, { action: 'moveTo', x: 1041, y: 689}, 'release' ]);
//          })
//          it('Tap Sign Out', async () => {
//             await tapElement(driver, `${Github.homeComponent.signOut}`)
//          })
//          it('Tap Click Pop Up Sign Out', async () => {
//             await tapElement(driver, `android=${Github.homeComponent.popUpSignOut}`)
//          })
//          after(async() => {
//             await driver.deleteSession()
//          })
//       })
//    // }) 
//    }
// }