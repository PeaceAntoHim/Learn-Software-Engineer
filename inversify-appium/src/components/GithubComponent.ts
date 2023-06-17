export class GithubComponent {
   public static loginComponent = {
     btnLogin: 'android=new UiSelector().resourceId("com.github.android:id/login_button")',
     username: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View/android.view.View/android.widget.EditText',
     password:
     '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View/android.view.View/android.view.View[2]/android.widget.EditText',
     login:
       '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View/android.view.View/android.view.View[2]/android.widget.Button',
     popUp:
       '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View[7]/android.widget.Button[2]',
     clickHere:
       '//android.view.View[@content-desc="click here"]/android.widget.TextView',
       continue: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View[7]/android.widget.Button[2]',
      authentication: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View/android.view.View[2]/android.widget.EditText',
      btnVerify: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.FrameLayout[1]/android.widget.FrameLayout[2]/android.webkit.WebView/android.view.View[2]/android.view.View/android.view.View[2]/android.widget.Button',
    };
    
    public static homeComponent = {
    allowButton: 'android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_button")',
     profileName: 'android=new UiSelector().resourceId("com.github.android:id/profile")',
     home: 'android=new UiSelector().resourceId("com.github.android:id/home")',
     organization: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout[1]/android.view.ViewGroup/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/androidx.compose.ui.platform.ComposeView[5]/android.view.View/android.view.View',
     realtech: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.widget.ViewAnimator/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/android.widget.LinearLayout',
     organizationRepo: 'android=new UiSelector().resourceId("com.github.android:id/container")',
     listRepo: 'android=new UiSelector().resourceId("com.github.android:id/repo_name")',
     back: '//android.widget.ImageButton[@content-desc="Back"]',
     settings: 'android=new UiSelector().resourceId("com.github.android:id/settings")',
     signOut: '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/androidx.recyclerview.widget.RecyclerView/android.widget.LinearLayout[12]/android.widget.RelativeLayout/android.widget.TextView',
     popUpSignOut: 'android=new UiSelector().resourceId("android:id/button1")'
   }
 }