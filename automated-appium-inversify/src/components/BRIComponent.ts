export class BRIComponent {
   public static loginComponent = {
      login: 'android=new UiSelector().text("Login").className("android.widget.Button")',
      username: 'android=new UiSelector().text("Username").className("android.widget.EditText")',
      password: 'android=new UiSelector().text("Password").className("android.widget.EditText")',
   };
   public static homeComponent = {
      notification: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/notif_lonceng")',
      titleNotification: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/title_notif")',
      messageNotification: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/message_notif")',
      messageTime: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/datetime_notif")',
      back: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.view.ViewGroup[1]/android.widget.ImageButton',
      akun: 'android=new UiSelector().text("Akun")',
      logOut: 'android=new UiSelector().text("Log Out")',
      confirmButton: 'android=new UiSelector().text("Ya")',
   };
}