import { configApp } from "../configs/configApp";

export class TabularComponent {
   public static loginComponent = {
    allow: 'android=new UiSelector().text("ALLOW")',
     language: 'android=new UiSelector().text("English")',
     getStarted: 'android=new UiSelector().text("Get Started")',
     signUp: 'android=new UiSelector().text("Login with Google")',
     account: `android=new UiSelector().text(${configApp.application.tabular.credential.username})`,
     openApp: 'android=new UiSelector().text("Open App")',
   };
   
   public static homeComponent = {
     bussinessCategory: 'android=new UiSelector().text("Account/CA")',
     bussinessTemplate: 'android=new UiSelector().text("Cash Register")',
     getText: 'android=new UiSelector().className("android.widget.TextView")',
     goBack: '//android.widget.Button[@content-desc="Go back"]',
     humberger: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[2]/android.widget.TextView',
     settings: 'android=new UiSelector().text("Settings")',
     logout: 'android=new UiSelector().text("Logout")',
     acceptLogout: 'android=new UiSelector().text("YES")'
   }
  }

