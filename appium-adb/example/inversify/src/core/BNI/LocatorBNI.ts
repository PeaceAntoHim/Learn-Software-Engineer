
const locator = {
   WELCOME_PAGE: {
       LOGIN_BTN: 'android=new UiSelector().textContains("Login").className("android.widget.Button")'
   },
   LOGIN_PAGE: {
       MPIN_FIELD: 'android=new UiSelector().resourceId("mpin").className("android.widget.EditText")',
       LOGIN_BTN: 'android=new UiSelector().textContains("Login").className("android.widget.Button")',
       WRONG_PASS: 'android=new UiSelector().resourceId("p2")'
   },
   DASHBOARD_PAGE: {
       TRANSFER_ICON: 'android=new UiSelector().clickable(true).childSelector(text("Transfer"))',
       REKENINGKU_ICON: 'android=new UiSelector().clickable(true).childSelector(text("Rekeningku"))',
       LOGOUT_ICON: 'android=new UiSelector().className("android.widget.TextView").index(3).clickable(true)',
       LOGOUT_YA_BTN: 'android=new UiSelector().className("android.widget.Button").text("Ya")'
   },
   TRANSFER_PAGE: {
       METODE_TRANSFER_TEXT: 'android=new UiSelector().text("Pilih Metode Transfer")',
       BNI_ICON: 'android=new UiSelector().description("BNI").clickable(true)'
   },
   ANTAR_BNI_PAGE:{
       //TODO: multi acc
       INPUT_BARU: 'android=new UiSelector().resourceId("pills-profile-tab").text("Input Baru")',
       REK_COL: 'android=new UiSelector().resourceId("toAccountB").className("android.widget.EditText")',
       AMOUNT_COL: 'android=new UiSelector().resourceId("amount").className("android.widget.EditText")',
       REMARK_COL: 'android=new UiSelector().resourceId("narative").className("android.widget.EditText")',
       SELANJUTNYA_BTN: 'android= new UiSelector().text("Selanjutnya").className("android.widget.Button")',
       SCROLL_TO_BOTTOM: `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Keterangan"))`

   },
   VALIDATION_PAGE:{
       VALIDASI_TEXT: 'android=new UiSelector().className("android.widget.TextView").text("Validasi")',
       REK_TUJUAN: 'android=new UiSelector().resourceId("destinationAccountNum")',
       NAMA_PENERIMA: 'android=new UiSelector().resourceId("destinationAccountName")',
       NOMINAL: 'android=new UiSelector().resourceId("amount")',
       FEE: 'android=new UiSelector().resourceId("fee")',
       PASSWORD_COL: 'android=new UiSelector().resourceId("passcode")',
       SELANJUTNYA_BTN: 'android= new UiSelector().text("Selanjutnya").className("android.widget.Button")',
   },
   STATUS_PAGE: {
       STATUS_TEXT: 'android=new UiSelector().text("Status")',
       BERHASIL: 'android=new UiSelector().text("Transaksi Berhasil")',
       KEMBALI_BTN: 'android=new UiSelector().text("Kembali ke Beranda").clickable(true)'
   },
   REKENINGKU_PAGE: {
       // TABUNGAN_ICON: 'android=new UiSelector().description("Tabungan & Giro").clickable(true)'
       TABUNGAN_ICON: 'android=new UiSelector().clickable(true).childSelector(text("Tabungan & Giro"))'
   },
   TABUNGAN_PAGE: {
       SALDO_EFEKTIF_TEXT: 'android=new UiSelector().text("Saldo Efektif")',

       /**
        * @param {String} accNo 
        * @returns 
        */
       tabunganAccCardByNo: (accNo) => {
           return `android=new UiSelector().className("android.view.View").clickable(true).childSelector(text("${accNo}"))`
       },
       SALDO_EFEKTIF: 'android=new UiSelector().resourceId("availableBalance")',
       HOME_ICON: 'android=new UiSelector().className("android.widget.TextView").index(3).clickable(true)'
   },
   ALERT: {
       ALERT_TITLE: 'android=new UiSelector().resourceId("andrid:id/alertTitle")',
       MESSAGE: 'android=new UiSelector().resourceId("android:id/message")',
       OK_BTN: 'android=new UiSelector().resourceId("android:id/button1").clickable(true)' 
   },
}

export { locator }