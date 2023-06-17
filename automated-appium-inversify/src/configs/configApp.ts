import dotenv from 'dotenv';
dotenv.config();

export const configApp = {
   deviceName: "V2050",
   application: {
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