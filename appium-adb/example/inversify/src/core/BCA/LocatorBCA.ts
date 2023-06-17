
const locator = {

   WELCOME_PAGE: {
       GANTI_KODE_AKSES: 'android=new UiSelector().text("Ganti Kode Akses")',
       BUKA_REK_BARU: 'android=new UiSelector().text("Buka Rekening Baru")',
       M_BCA_BTN: 'android= new UiSelector().resourceId("com.bca:id/main_btn_bca")',
       KODE_AKSES_TEXT: 'android=new UiSelector().resourceId("com.bca.id/dlg_text_title).text("Kode Akses")',
       PASS_COL: 'android=new UiSelector().resourceId("com.bca:id/login_edit_text")',
       LOGIN_BTN: 'android=new UiSelector().resourceId("com.bca:id/login_ok_button")'
   },
   DASHBOARD_PAGE: {
       M_INFO_ICON: 'android=new UiSelector().description("Icon m-Info").clickable(true)',
       M_TRANSFER_ICON: 'android=new UiSelector().description("Icon m-Transfer").clickable(true)',
       M_ADMIN_ICON: 'android=new UiSelector().description("Icon m-Admin").clickable(true)',
       SECURITY_NOTIF: 'android=new UiSelector().resourceId("com.bca:id/prompt_security_img")',
       POPUP_LOGOUT_BTN: 'android=new UiSelector().description("PopUp Button - Logout").clickable(true)'
   },
   M_TRANSFER_PAGE:{
       PAGE_TITLE: 'android=new UiSelector().resourceId("com.bca:id/tv_title").text("m-Transfer")',
       DAFTAR_ANTAR_REK_BTN: 'android=new UiSelector().description("menu Daftar Transfer - Antar Rekening").clickable(true)',
       NO_REK_TUJUAN_COL_1: 'android=new UiSelector().resourceId("com.bca:id/antar_rekening_et1")',
       SEND_BTN: 'android=new UiSelector().text("Send").clickable(true)',

       ACC_NAME_FIELD: 'android=new UiSelector().resourceId("com.bca:id/confirm_screen_tv_1_2")', //INVALID, ALREADY REGISTERED, ACC_NAME
       CENTANG_ACC: 'android=new UiSelector().resourceId("com.bca:id/confirm_screen_cb_1").clickable(true)',
       SUCCESS_DIALOG: 'android=new UiSelector().resourceId("com.bca:id/dlg_sh_msg").textContains("berhasil didaftarkan")',
       OK_BTN: 'android=new UiSelector().description("PopUp Button - Ok").clickable(true)',

       TRANS_ANTAR_REK_BTN: 'android=new UiSelector().description("menu Transfer - Antar Rekening").clickable(true)',
   },
   INPUT_TRANS_INFO_PAGE:{
       DARI_REK_TEXT: 'android=new UiSelector().text("Dari Rekening:")',
       TO_INPUT_BENEFICIARY_PAGE_BTN: 'android=new UiSelector().description("Ke Rekening (Pilih Rekening Tujuan)")',

       REK_SENDIRI_TEXT: 'android=new UiSelector().text("Rekening Sendiri")',
       SEARCH_COL: 'android=new UiSelector().text("Search").clickable(true)',
       FIRST_SEARCH_RES: 'android=new UiSelector().resourceId("com.bca:id/transfer_list_item_container").clickable(true)',

       INPUT_AMT_BTN: 'android=new UiSelector().description("Input jumlah uang").clickable(true)',
       INPUT_AMT_COL: 'android=new UiSelector().resourceId("com.bca:id/edit_text_input_dialog")',
       INPUT_AMT_OK_BTN: 'android=new UiSelector().description("Ok btn input dialog-Jumlah Uang:").clickable(true)',
      
       INPUT_REMARK_BTN: 'android=new UiSelector().description("Input Berita Transfer").clickable(true)',
       INPUT_REMARK_COL: 'android=new UiSelector().resourceId("com.bca:id/m_input_dialog_edtTxt_input1")',
       INPUT_REMARK_OK_BTN: 'android=new UiSelector().resourceId("com.bca:id/m_input_dialog_btn_inputOk1").clickable(true)',

       SEND_BTN: 'android=new UiSelector().text("Send").clickable(true)',
       
       CONFIRM_CONTENT: 'android=new UiSelector().resourceId("com.bca:id/dlg_sh_msg")',
       CONFIRM_OK_BTN: 'android=new UiSelector().description("PopUp Button - Ok")',
       CONFIRM_CANCEL_BTN: 'android=new UiSelector().description("PopUp Button - Cancel")',
   },
   DIALOG_SH: {
       TITLE: 'android=new UiSelector().resourceId("com.bca:id/dlg_sh_title")',
       MESSAGE_FIELD: 'android=new UiSelector().resourceId("com.bca:id/dlg_sh_msg")',
       OK_BTN: 'android=new UiSelector().description("PopUp Button - Ok").clickable(true)'
   },
   M_INFO_PAGE: {
       PAGE_TITLE: 'android=new UiSelector().resourceId("com.bca:id/tv_title").text("m-Info")',
       INFO_SALDO_BTN: 'android=new UiSelector().description("menu info saldo ")',
       DIALOG_HEADER: 'android=new UiSelector().resourceId("com.bca:id/dialog_title_header")',
       // BALANCE: 'android=new UiSelector().className("android.view.View").textContains(".00")', // still prob
       BALANCE: 'android=new UiSelector().className("android.view.View").textMatches(".*\\.\\d\\d$")',
       OK_BTN: 'android=new UiSelector().className("android.widget.Button").text("OK").clickable(true)'
   },
   M_ADMIN_PAGE:{
       PAGE_TITLE: 'android=new UiSelector().resourceId("com.bca:id/tv_title").text("m-Admin")',
       SCROLL_TO_HAPUS_DAFTAR: 'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().description("menu Hapus Daftar - Transfer Antar Rekening"))',
       HAPUS_DAFTAR_BTN: 'android=new UiSelector().description("menu Hapus Daftar - Transfer Antar Rekening").clickable(true)',
       CENTANGS: 'android=new UiSelector().resourceId("com.bca:id/item_m_admin_hapus_rek_cb_1")',
       DELETE_BTN: 'android=new UiSelector().resourceId("com.bca:id/m_admin_hapus_rek_btn_ok").clickable(true)',
   },
   PIN_DIALOG:{
      TITLE: 'android=new UiSelector().resourceId("com.bca:id/label_description").text("PIN m-BCA:")',
      INPUT_COL: 'android=new UiSelector().resourceId("com.bca:id/input_text")',
      OK_BTN: 'android=new UiSelector().description("PopUp PIN Button - OK").clickable(true)'
   },
   HOME_BTN: 'android=new UiSelector().description("BottomNav Icon - Home").clickable(true)',
   INDICATOR:{
       GREEN: 'android=new UiSelector().resourceId("com.bca:id/image_state_color").description("Green_Indicator")',
       RED: 'android=new UiSelector().resourceId("com.bca:id/image_state_color").description("Red_Indicator")',
       BLUE: 'android=new UiSelector().resourceId("com.bca:id/image_state_color").description("Blue_Indicator")'
   },
   DIALOG_ERROR: 'android=new UiSelector().className("android.widget.TextView")'
   
}

export { locator }