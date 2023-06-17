import { Browser, remote } from 'webdriverio';
import WebView from '../helpers/WebView';
import ProjectCapabilities from '../android/projectCapabilities';

let browser: Browser
const init = async () => {
   browser = await remote(ProjectCapabilities.githubBaseCapabilities());
}
init()
class WebViewScreen extends WebView {
    /**
     * Wait for the screen to be displayed based on Xpath
     */
    async waitForWebViewIsDisplayedByXpath (isShown = true): Promise<boolean|void> {
        const selector =  browser.isAndroid ? '*//android.webkit.WebView' : '*//XCUIElementTypeWebView';

        return browser.$(selector).waitForDisplayed({
            timeout: 45000,
            reverse: !isShown,
        });
    }
}

export default new WebViewScreen();