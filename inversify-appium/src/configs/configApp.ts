import dotenv from 'dotenv';
dotenv.config();

export const configApp = {
   deviceName: "V2050",
   application: {
      github: {
         appPackage: "com.github.android",
         appActivity: 'com.github.android.activities.MainActivity',
         credential: {
            username: process.env.usernameGithub as string, // Add your github username
            password: process.env.passwordGithub as string, // Add your github password
         }
      },
      tabular: {
         appPackage: "com.swific.registerbook",
         appActivity: "com.swific.registerbook.MainActivity",
         credential: {
            username: process.env.name as string
         }
      },
      authy: {
         appActivity: "com.authy.authy/com.authy.authy.activities.InitializationActivity"
      },
      BCA: {
         appPackage: "com.bca",
         appActivity: "com.bca/.mobile.MainActivity",
         credential: {
            password: process.env.passwordBCA as string,
            pin: process.env.pinBCA as string
         }
      },
      BRI: {
         appPackage: "id.co.bri.brimo",
         credential: {
            username: process.env.usernameBRI as string,
            password: process.env.passwordBRI as string,
         }
      },
      BNI: {
         appPackage: "id.co.bri.brimo",
         credential: {
            userID: process.env.userID as string,
            MPIN: process.env.MPIN as string,
         }
      }
   }

}