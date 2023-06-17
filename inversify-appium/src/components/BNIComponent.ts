export class BNIComponent {
   public static welcomePage = {
         LOGIN_BTN: 'android=new UiSelector().textContains("Login").className("android.widget.Button")'
   }

   public static loginPage = {
      MPIN_FIELD: 'android=new UiSelector().resourceId("mpin").className("android.widget.EditText")',
      USERID_FIELD: 'android=new UiSelector().resourceId("userid").className("android.widget.EditText")',
      LOGIN_BTN: 'android=new UiSelector().textContains("Login").className("android.widget.Button")',
      WRONG_PASS: 'android=new UiSelector().resourceId("p2")'
   }

   public static dashboardPage = {
      TRANSFER_ICON: 'android=new UiSelector().clickable(true).childSelector(text("Transfer"))',
      REKENINGKU_ICON: 'android=new UiSelector().clickable(true).childSelector(text("Rekeningku"))',
      RIWAYAT_ICON: 'android=new UiSelector().description("Riwayat")',
      LOGOUT_ICON: 'android=new UiSelector().className("android.widget.TextView").index(3).clickable(true)',
      LOGOUT_YA_BTN: 'android=new UiSelector().className("android.widget.Button").text("Ya")'
   }

   public static alert = {
      OK_BTN: 'android=new UiSelector().resourceId("android:id/button1").clickable(true)',
      keepLaterUserId: 'android=new UiSelector().text("Nanti Saja")'
   }

   public static riwayatPage = {
      PERIOD_TODAY: 'android=new UiSelector().resourceId("pickToday")',
      PERIOD_WEEKLY: 'android=new UiSelector().resourceId("pickMingguan")',
      PERIOD_MONTHLY: 'android=new UiSelector().resourceId("pickBulanan")',
      NEXT_BUTTON: 'android=new UiSelector().text("Selanjutnya")',
      GET_ALL_TRANSACTION:'android=new UiSelector().className("android.widget.GridView")',

   }
}