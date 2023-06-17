export class BCAComponent {
   public static loginComponent = {
      mBca: 'android=new UiSelector().text("m-BCA")',
      input: 'android=new UiSelector().resourceId("com.bca:id/login_edit_text")',
      login: 'android=new UiSelector().resourceId("com.bca:id/login_ok_button")',
   }
   public static homeComponent = {
      greenIndicator: 'android=new UiSelector().resourceId("com.bca:id/image_state_color")',
      mInfo: 'android=new UiSelector().description("Icon m-Info")',
      mutasi: 'android=new UiSelector().text("Mutasi Rekening")',
      startDate: 'android=new UiSelector().resourceId("com.bca:id/mutasi_rekening_et_startdate")',
      previous: '//android.widget.ImageButton[@content-desc="Previous month"]',
      date: 'android=new UiSelector().text("5")',
      ok: 'android=new UiSelector().text("OK")',
      send: 'android=new UiSelector().text("Send")',
      textView: 'android=new UiSelector().resourceId("android.widget.TextView")'
   }

   public static mutationComponent = {
      INPUT_TEXT: 'android=new UiSelector().resourceId("com.bca:id/input_text")',
      BUTTON_OK: 'android=new UiSelector().resourceId("com.bca:id/button_2")'
   }
}