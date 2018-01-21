import { TabsPage } from './pages/tabs/tabs';
import { VerificationPage } from './pages/verification/verification';

export namespace Settings {
  // replace with your key
  export const firebaseConfig = {
    apiKey: "AIzaSyAESjVeLlSnYFPjBz2K7L20i-WSATLNz8k",
    authDomain: "hbcuwallstreet-db863.appspot.com",
    databaseURL: "https://moneychat-be2e3.firebaseio.com",
    projectId: "project-39065714117",
    storageBucket: "hbcuwallstreet-db863.appspot.com",
    messagingSenderId: ""
  };

  // For Facebook Login
  export const facebookLoginEnabled = true;
  export const facebookAppId: string = "469723673423568"; // Not required, If you're not using FBLogin

  //For Google Login
  export const googleLoginEnabled = true;
  export const googleClientId: string = "845839389008-s0scp3mghdi67t5ga9t56j6265ibonp5.apps.googleusercontent.com"; // Not Required, If you're not using Google+ login

  // For PhoneNumber Login
  // we used Facebook AccountKit for PhoneNumber Validation
  // Limitation: customToken will generate only if you have firebase blaze plan
  export const phoneLoginEnabled = true; // only works on real devices
  export const customTokenUrl: string = "https://us-central1-chatapp-3f829.cloudfunctions.net/getCustomToken"; // Not Required, If you're not using PhoneNumber login

  export const homePage = TabsPage;
  export const verificationPage = VerificationPage;
}
