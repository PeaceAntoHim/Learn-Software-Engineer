

const locator = {
   FAST_MENU_PAGE: {
       LOGIN_BTN: 'android=new UiSelector().text("Login").clickable(true)'
   },

   LOGIN_PAGE: {
       USERNAME: 'android=new UiSelector().text("Username").className("android.widget.EditText")',
       PASSWORD: 'android=new UiSelector().text("Password").className("android.widget.EditText")',
       LOGIN_BTN: 'android=new UiSelector().text("Login").className("android.widget.Button")',
       WRONG_USER_PASS: 'android=new UiSelector().text("Username atau password yang Anda masukkan salah. Silakan coba kembali.").className("android.widget.TextView")'
   },

   DASHBOARD_PAGE: {
       REKENING_LAIN: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/tv_rek_lain")',
       TRANSFER_ICON: 'android=new UiSelector().text("Transfer").clickable(true)',
       LOG_OUT_CONFIRM: 'android=new UiSelector().textContains("keluar dari aplikasi").className("android.widget.TextView")',
       LOG_OUT_YES_BTN: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/btn_yes")',
       POPUP_CLOSE_BTN: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/iv_close_tutorial").clickable(true)'
   },
   FORM_TRANSFER_ALIAS_PAGE: {
       DAFTAR_TRANSFER_TEXT: 'android=new UiSelector().text("Daftar Transfer")',
       TAMBAH_DAFTAR_BARU_BTN: 'android=new UiSelector().textContains("Tambah").className("android.widget.Button").clickable(true).enabled(true)'
   },
   TAMBAH_TRANSFER_ALIAS_PAGE: {
       REKENING_FIELD: 'android=new UiSelector().text("Masukkan Nomor Rekening / Alias").className("android.widget.EditText")',
       TAMBAH_BARU_BTN: 'android=new UiSelector().text("Lanjutkan").clickable(true).enabled(true)'
   },
   INQUIRY_GENERAL_PAGE: {
       SIMPAN_SELANJUTNYA: 'android=new UiSelector().text("Simpan untuk selanjutnya")',
       ACC_NAME: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/tv_nama_briva")',
       AMOUNT_COL: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/edNominal")',
       TRANSFER_BTN: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/btnSubmit").enabled(true)',
       SALDO_TDK_CUKUP_TEXT: 'android=new UiSelector().text("Saldo Anda tidak cukup")'
   },
   CONFIRM_PAGE: {
       KONFIRMASI_TEXT: 'android=new UiSelector().text("Konfirmasi")',
       BENEFICIARY_ACC_NO: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/tv_nomor_payment")',

       //AMOUNT [0]
       //BIAYA [1]
       VALUE_FIELD: `android=new UiSelector().resourceId("id.co.bri.brimo:id/tv_detail_value")`,

       REMARK_COL: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/edketerangan").clickable(true)',
       TRANSFER_BTN: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/btnSubmit").enabled(true).clickable(true)',

       BATAL_POPUP: 'android=new UiSelector().text("Pembatalan Transaksi")',
       BATAL_YES_BTN: 'android=new UiSelector().className("android.widget.Button").clickable(true).text("Ya")',
   },
   INPUT_PIN_PAGE: {
       MASUKAN_PIN_TEXT: 'android=new UiSelector().text("Masukkan PIN")',
       PIN_NUMBER: [
           'android=new UiSelector().text("0").clickable(true).enabled(true)',
           'android=new UiSelector().text("1").clickable(true).enabled(true)',
           'android=new UiSelector().text("2").clickable(true).enabled(true)',
           'android=new UiSelector().text("3").clickable(true).enabled(true)',
           'android=new UiSelector().text("4").clickable(true).enabled(true)',
           'android=new UiSelector().text("5").clickable(true).enabled(true)',
           'android=new UiSelector().text("6").clickable(true).enabled(true)',
           'android=new UiSelector().text("7").clickable(true).enabled(true)',
           'android=new UiSelector().text("8").clickable(true).enabled(true)',
           'android=new UiSelector().text("9").clickable(true).enabled(true)',
       ],
       WRONG_PIN: 'android=new UiSelector().className("android.widget.TextView").text("PIN Anda salah")'
   },
   RECEIPT_PAGE: {
       BERHASIL_TEXT: 'android=new UiSelector().text("Transaksi Berhasil")',
       OK_BTN: 'android=new UiSelector().text("OK").className("android.widget.Button")'
   },
   ACCOUNT_PAGE: {
       BALANCE_TAG: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/tv_rekening_saldo")',
       BACK_ARROW: 'android=new UiSelector().className("android.widget.ImageButton")'
   },
   ALERT: 'android=new UiSelector().resourceId("id.co.bri.brimo:id/snackbar_text")'
}

export { locator }