import { Browser, Element } from "webdriverio";
import { Github } from "./app";
// Wait up to 5 seconds
const MAX_ELEMENT_WAIT_THRESHOLD_MS = 5000;
async function findElement(
  driver: Browser,
  elementLocator: string,
  timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS,
) {
  const element: Element = await driver.$(elementLocator);
  await element.waitForExist({
    timeout: timeout,
  });
  return element;
}

async function getElement(
   driver: Browser,
   elementLocator: string,
   timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS
) {
   const element: Element = await findElement(driver, elementLocator, timeout);
  //  const getKey = await element.getElementText(await element.getText())
  //  console.log(await element.getElementText(`element-${element.getText()}`))
   return element.getText();
}

async function findListElement(
  driver: Browser,
  elementLocator: string,
  timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS,
) {
  const findElement: Element = await driver.$(elementLocator);
  await findElement.waitForExist({
    timeout: timeout,
  });
  await driver.touchAction([ {action: 'longPress', x: 1052, y: 1567}, { action: 'moveTo', x: 1041, y: 689}, 'release' ]);
  const element = await driver.$$(elementLocator).map((i) => i.getText())

  return element
}

async function getListElement(
  driver: Browser,
  elementLocator: string,
  timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS
  )  
{
  const element = await findListElement(driver, elementLocator, timeout);

  return element
}

async function tapElement(
  driver: Browser,
  elementLocator: string,
  timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS,
) {
  const element: Element = await findElement(
    driver,
    elementLocator,
    timeout,
  );
   
  return element.click();
}


async function setValueOfElement(
  driver: Browser,
  elementLocator: string,
  value: string,
  timeout: number = MAX_ELEMENT_WAIT_THRESHOLD_MS,
) {
  const element: Element = await findElement(
    driver,
    elementLocator,
    timeout,
  );
  // const selector = element.isAndroid ?? "*//android.webkit.WebView" 
  return element.setValue(value);
}
export { setValueOfElement, tapElement, getElement, getListElement };
