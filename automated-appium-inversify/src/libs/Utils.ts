import { Browser, Element } from "webdriverio";


export class Utils {
   private _driver: Browser
   private _timeout: number = 50000;

   /**
    * @constructor
    * @param driver 
    * @requires
    * @type {Browser}
    */
   constructor(driver: Browser) {
      this._driver = driver
   }

   delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

   /**
    * This method to find element from application
    * @param elementLocator
    * @returns {Promise<Element>}
    */
    private async findElement(elementLocator: string): Promise<Element> {
      const element: Element = await this._driver.$(elementLocator);
      await element.waitForExist({
        timeout: this._timeout,
      });
      return element;
    }

    /**
     * This method to find list of elements from application
     * @param elementLocator
     * @returns {Promise<string[]>}
     */
    private async findElements(elementLocator: string): Promise<string[]> { 
      const findElement: Element = await this.findElement(elementLocator);
      await findElement.waitForExist({
         timeout: this._timeout,
      })
      await this._driver.touchAction([ 
         {action: 'longPress', x: 1052, y: 1567}, { action: 'moveTo', x: 1041, y: 689}, 'release' 
      ]);
      const listElement: string[] = await this._driver.$$(elementLocator).map((i: WebdriverIO.Element) => i.getText())
   
      return listElement
    }

    /**
     * This @method getElement 
     * To get element 
     * from @method findElement
     * @param elementLocator
     * @returns {Promise<string>}
     */
    async getElement(elementLocator: string) : Promise<string> {
      const element: Element = await this.findElement(elementLocator);
      return element.getText();
    }

    /**
     * This @method getElements 
     * To get list of elements 
     * from @method findElements
     * @param elementLocator
     * @returns {Promise<string>}
     */
    async getElements(elementLocator: string) : Promise<string[]> {
      const listElement: string[] = await this.findElements(elementLocator);
      return listElement;
    }
    
    /**
     * This @method tapElement 
     * @param elementLocator
     * To tap element Application
     * Get Element from @method findElement
     * @returns {Promise<void>}
     */
    async tapElement(elementLocator: string): Promise<void> {
      const element: Element = await this.findElement(elementLocator);
      return element.click();
    }

    /**
     * This @method setValueOfElement 
     * @param elementLocator
     * @param value
     * Get Element from @method findElement
     * To set value of element Application
     * @returns {Promise<void>}
     */
    async setValueOfElement(elementLocator: string, value: string): Promise<void> {
      const element: Element = await this.findElement(elementLocator);
      return element.setValue(value);
    }
}