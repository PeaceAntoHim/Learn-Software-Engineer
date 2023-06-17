
import ProjectCapabilities from '../android/projectCapabilities';
import { Browser, remote} from 'webdriverio'
import { getElement, getListElement, setValueOfElement, tapElement } from '../android/utils'
import { runAdbAuthy, runAdbGithub } from '../android/ADB';
import { Authy, Github } from '../android/app';
import { GithubService } from '../example/DI-appium/service/Github';


describe("Android Github App Test", function() {
   let driver: Browser;
   this.timeout(40000) 
   let key: string
   before(async () => {
      const remoteOptions = ProjectCapabilities.githubBaseCapabilities()
      driver = await remote(remoteOptions)
   });
   it('Tap Button Login Github', async function (){
     await tapElement(driver, `android=${Github.loginComponent.btnLogin}`);
   });
   it('Set Value Username Github', async () => {
      await setValueOfElement(
         driver,
          Github.loginComponent.username,
         "VizzedBuzzed",
         );
   })
   it('Set Value Password Github', async () => {
      await setValueOfElement(
         driver,
         Github.loginComponent.password,
         "@Vizzbuzzed123",
       );
   })
   it('Tap Github Webview Login Button', async () => {
      await tapElement(driver, Github.loginComponent.login);
   })
   it('Open Authy App Use ADB', async () => {
      runAdbAuthy()
      key = await getElement(
         driver,
         `android=${Authy.keyComponents.keyAuth}`,
      )
      console.log(`--> ${key.replace(/\s/g, '')}`)
   })
   it('Open Authy App Use ADB', async () => {
      runAdbGithub()
   })
   it('Set Value Key Authy', async () => {
      await setValueOfElement(driver, Github.loginComponent.authentication, key.replace(/\s/g, ''))
   })
   it('Tap Button Verify Github', async () => {
      await tapElement(driver, Github.loginComponent.btnVerify)
   })
   it('Tap Link Continue', async () => {
      await tapElement(driver, Github.loginComponent.continue)
   })
   it('Tap Click Here', async () => {
      await tapElement(driver, Github.loginComponent.clickHere)
   })
   it("Tap Github Home", async () => {
      await tapElement(driver, `android=${Github.homeComponent.home}`)
   })
   it("Tap Icon Organization", async () => {
      await tapElement(driver, Github.homeComponent.organization)
   })
   it("Tap Realtech Icon", async () => {
      await tapElement(driver, Github.homeComponent.realtech)
   })
   it("Tap Organization Repo", async () => {
      await tapElement(driver, `android=${Github.homeComponent.organizationRepo}`)
   })
   it("Log All List Repo", async () => {
      const listRepo = await getListElement(driver, `android=${Github.homeComponent.listRepo}`)
 
      console.log("--> " + listRepo)
   })
   it('Back from list repo', async () => {
      await tapElement(driver, `${Github.homeComponent.back}`)
   })
   it('Back from realtechltd', async () => {
      await tapElement(driver, `${Github.homeComponent.back}`)
   })
   it('Back from Organization', async () => {
      await tapElement(driver, `${Github.homeComponent.back}`)
   })
   it('Tap Click User Profile', async () => {
     await tapElement(driver, `android=${Github.homeComponent.profileName}`)
   })
   it('Tap Click Settings', async () => {
      await tapElement(driver, `android=${Github.homeComponent.settings}`)
      await driver.touchAction([ {action: 'longPress', x: 1052, y: 1567}, { action: 'moveTo', x: 1041, y: 689}, 'release' ]);
   })
   it('Tap Sign Out', async () => {
      await tapElement(driver, `${Github.homeComponent.signOut}`)
   })
   it('Tap Click Pop Up Sign Out', async () => {
      await tapElement(driver, `android=${Github.homeComponent.popUpSignOut}`)
   })
   after(async() => {
      await driver.deleteSession()
   });
})
