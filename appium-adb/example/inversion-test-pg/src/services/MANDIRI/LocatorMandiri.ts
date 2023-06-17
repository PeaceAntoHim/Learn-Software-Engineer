
const locator = {

   WELCOME_PAGE: {
      LOGIN_BTN: 'android=new UiSelector().clickable(true).resourceId("id.bmri.livin:id/content")' 
   },
   LOGIN_PAGE: {
       PASS_COL: 'android=new UiSelector().className("android.widget.EditText").text("Password").clickable(true)',
       LOGIN_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_login")',
       ERROR_LABEL: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_error_label")'
   },
   DASHBOARD_PAGE: {
       
       //$$ index 0
       ACTION_ICONS: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_candy")',
       TABUNGAN_DEPOSITO_TEXT: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_title_widget").text("Tabungan & Deposito")',
       /**
        * @param {String} accNo 
        * @returns 
        */
       tabunganAccCardByNo: (accNo) => {
           return `android=new UiSelector().resourceId("id.bmri.livin:id/cv_main").childSelector(resourceId("id.bmri.livin:id/tv_account_number").text("${accNo}"))`
       },
       LOGOUT_BTN: 'android=new UiSelector().description("Log Out").clickable(true)',
       BOTTOM_LOGOUT: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_modal_bottom_sheet_dialog").text("Log Out").clickable(true)'
   },
   TRANSFER_PAGE:{
       PENERIMA_BARU_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_new_destination").clickable(true)',
   },
   PENERIMA_BARU_PAGE:{
       NO_REK_COL: 'android=new UiSelector().resourceId("id.bmri.livin:id/textInputEditText").text("Nomor Rekening")',
       ERROR_FIELD: 'android=new UiSelector().resourceId("id.bmri.livin:id/textinput_error")',
       LANJUTKAN_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_next").text("Lanjutkan")',
       NAMA_PENERIMA: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_title")',
       BOTTOM_LANJUTKAN_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_next").index(3).clickable(true)',

   },
   INPUT_AMOUNT_PAGE:{
       AMOUNT_COL: 'android=new UiSelector().resourceId("id.bmri.livin:id/textInputEditText")',
       ERROR_FIELD: 'android=new UiSelector().resourceId("id.bmri.livin:id/textinput_error")',
       SELESAI_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_done").text("Selesai")',
       TAMBAH_KET_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_transfer_note").text("Tambah Keterangan")',
       REMARK_COL: 'android=new UiSelector().resourceId("id.bmri.livin:id/textInputEditText").text("Keterangan")',
       SIMPAN_KET_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_save").text("Simpan").clickable(true)',
       LANJUTKAN_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_next").text("Lanjutkan").clickable(true)'
   },
   CONFIRM_PAGE:{
       ACC_NO: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_account").index(1)',
       NOMINAL_AMOUNT: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_amount")',
       LANJUT_TRANS_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/btn_confirmation_total")',
       CANCEL_X_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/iv_close").clickable(true)'
   },
   INPUT_PIN_PAGE:{
       TITLE: 'android=new UiSelector().resourceId("id.bmri.livin:id/title").text("Masukkan PIN")',
       PIN_NUMBER: [
           'android=new UiSelector().resourceId("id.bmri.livin:id/padZero").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padOne").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padTwo").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padThree").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padFour").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padFive").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padSix").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padSeven").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padEight").clickable(true)',
           'android=new UiSelector().resourceId("id.bmri.livin:id/padNine").clickable(true)',
       ],
       ERROR_PIN: 'android=new UiSelector().resourceId("id.bmri.livin:id/description").textContains("tidak sesuai")'
   },
   SUCCESS_PAGE:{
       BERHASIL_TEXT: 'android=new UiSelector().resourceId("id.bmri.livin:id/transfer_status_title").text("Transfer Berhasil!")',
       X_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/transfer_close_icon").clickable(true)',
   },
   TABUNGAN_PAGE:{
       AVAILABLE_BALANCE: 'android=new UiSelector().resourceId("id.bmri.livin:id/tv_available_balance")'
   },
   ALERT: {
       PANEL_CONTENT: 'android=new UiSelector().resourceId("id.bmri.livin:id/panelContent")',
       MESSAGE: 'android=new UiSelector().resourceId("id.bmri.livin:id/message")',
       LOGIN_BTN: 'android=new UiSelector().resourceId("id.bmri.livin:id/positive_btn").text("LOGIN")'
   }
}

export { locator}