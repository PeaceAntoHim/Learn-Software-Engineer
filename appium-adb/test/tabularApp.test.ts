import { Browser, RemoteOptions, remote } from "webdriverio"
import ProjectCapabilities from "../android/projectCapabilities"
import { Tabular } from "../android/app"
import { getElement, getListElement, tapElement } from "../android/utils"


describe("Android Tabular App Test", function () {
   let driver: Browser
   this.timeout(40000)
   before(async () => {
      const remoteOptions: RemoteOptions = ProjectCapabilities.tabularBaseCapabilities() 
      driver = await remote(remoteOptions)
   })
   it("Select language", async () => {
      await tapElement(driver, Tabular.loginComponent.language)
   })
   it("Signup To Application", async () => {
      await tapElement(driver, Tabular.loginComponent.signUp)
   })
   it("Signup Use Google Account", async () => {
      await tapElement(driver, Tabular.loginComponent.account)
   })
   it("Click Data Table", async () => {
      await tapElement(driver, Tabular.homeComponent.file)
   })
   it("Get All List Title Table", async () => {
      // const data = await getListElement(driver, Tabular.homeComponent.titleTable)
      // console.log('--> Data ' + data)
      const data = await getListElement(driver, `android=${Tabular.homeComponent.test}`)
      console.log('--> Data ' + data)
   })
   after(async() => {
      await driver.deleteSession()
   });
})