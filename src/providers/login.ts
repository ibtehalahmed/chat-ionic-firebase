import { Injectable, NgZone } from '@angular/core';

import { Settings } from '../settings';
import { NavController, Platform, ToastController, AlertController } from 'ionic-angular';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';
import { Http } from '@angular/http';

import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';

import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';

@Injectable()
export class LoginProvider {

  private navCtrl: NavController;


  constructor(public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public zone: NgZone, public googleplus: GooglePlus,
    public platform: Platform, public afAuth: AngularFireAuth, public http: Http, public toastCtrl: ToastController, public facebook: Facebook, public alert: AlertController) {
    console.log("Initializing Login Provider");
    // Detect changes on the Firebase user and redirects the view depending on the user's status.
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (user["isAnonymous"]) {
          //Goto Trial Page.
          // this.navCtrl.setRoot(Login.trialPage, { animate: false });
        } else {
          this.zone.run(() => {
              this.navCtrl.setRoot(Settings.homePage, { animate: false });
          });
        }
      }
    });
  }

  setNavController(navCtrl) {
    this.navCtrl = navCtrl;
  }

  // Facebook Login, after successful authentication, triggers firebase.auth().onAuthStateChanged((user) on top and
  // redirects the user to its respective views. Make sure to set your FacebookAppId on login.ts
  // and enabled Facebook Login on Firebase app authentication console.
  facebookLogin() {
    console.log(this.platform);
    if(this.platform.is('core')){
      this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(res=>{
        let credential = firebase.auth.FacebookAuthProvider.credential(res.credential.accessToken);
        this.loadingProvider.show();
        firebase.auth().signInWithCredential(credential)
        .then((success) => { this.loadingProvider.hide(); })
        .catch((error) => {
          this.loadingProvider.hide();
          let code = error["code"];
          this.alertProvider.showErrorMessage(code);
        });
      }).catch( error=>{
        console.log(error);
      });
    } else{
      this.facebook.login(['public_profile', 'email']).then( res => {
        console.log(res);
        let credential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        this.loadingProvider.show();
        firebase.auth().signInWithCredential(credential)
        .then((success) => {
          console.log(success);
          this.facebook.api("me/?fields=id,email,first_name,picture",["public_profile","email"])
          .then( data => {
            console.log(data)
            let uid = firebase.auth().currentUser.uid;
            this.createNewUser(uid,data.first_name,data.email,uid,'I am available','Facebook',data.picture.data.url);
          })
          .catch( err => {
            console.log(err);
            this.loadingProvider.hide();
          })
          
        })
        .catch((error) => {
          this.loadingProvider.hide();
          let code = error["code"];
          this.alertProvider.showErrorMessage(code);
        });
        
      }).catch( err=> console.log(err));
    }
  }

  // Google Login, after successful authentication, triggers firebase.auth().onAuthStateChanged((user) on top and
  // redirects the user to its respective views. Make sure to set your GoogleWebClient Id on login.ts
  // and enabled Google Login on Firebase app authentication console.
  googleLogin() {
    if(this.platform.is('core')){
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(data=>{
        console.log(data);
        let credential = firebase.auth.GoogleAuthProvider.credential(data.credential.idToken,data.credential.accessToken);
        firebase.auth().signInWithCredential(credential)
          .then((success) => {
            this.loadingProvider.hide();
          })
          .catch((error) => {
            this.loadingProvider.hide();
            let code = error["code"];
            this.alertProvider.showErrorMessage(code);
          });
      }).catch( err=>{
        console.log(err)
      });
    }
    else{
      this.loadingProvider.show();
      this.googleplus.login({
        'webClientId': Settings.googleClientId
      }).then((success) => {
        console.log(success);
        let credential = firebase.auth.GoogleAuthProvider.credential(success['idToken'], null);
        firebase.auth().signInWithCredential(credential)
          .then((success) => {
            this.loadingProvider.hide();
          })
          .catch((error) => {
            this.loadingProvider.hide();
            let code = error["code"];
            this.alertProvider.showErrorMessage(code);
          });
      }, error => { 
        console.log(error);
        this.loadingProvider.hide();
      });
    }
  }


  // Login on Firebase given the email and password.
  emailLogin(email, password) {
    this.loadingProvider.show();
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((success) => {
        this.loadingProvider.hide();
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }
  phoneLogin(){
    if(this.platform.is('core')){
      this.toastCtrl.create({message: 'AccountKit only works on device', duration: 3000}).present();
    }
    else{
      (<any>window).AccountKitPlugin.loginWithPhoneNumber({
        useAccessToken: true,
        defaultCountryCode: "IN",
        facebookNotificationsEnabled: true,
      }, data => {

      (<any>window).AccountKitPlugin.getAccount(
        info => { // getting user info
          let phoneNumber = info.phoneNumber;
          this.http.get(Settings.customTokenUrl+"?access_token="+info.token).subscribe( data=>{
            let token = data['_body'];
            this.loadingProvider.show();
            firebase.auth().signInWithCustomToken(token).then( data=>{
              let uid = firebase.auth().currentUser.uid;
              this.createNewUser(uid,phoneNumber,uid,null,'I am available','Phone','assets/images/profile.png')
              this.loadingProvider.hide();
            }).catch( err=> {
              this.loadingProvider.hide();
              console.log(err)
            });
                    
          }, err=>{
            console.log(err);
          });
        },
        err =>  console.log(err) );
      });
    }
  }
  // Register user on Firebase given the email and password.
  register(name, username, email, password,img) {
    this.loadingProvider.show();
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((success) => {
        console.log("Register success");
        let user=firebase.auth().currentUser;
        // firebase.auth().currentUser.sendEmailVerification();
        this.createNewUser(user.uid, name , username,user.email,"I am available","Firebase",img);
        this.loadingProvider.hide();
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  // Send Password Reset Email to the user.
  sendPasswordReset(email) {
    this.loadingProvider.show();
    firebase.auth().sendPasswordResetEmail(email)
      .then((success) => {
        this.loadingProvider.hide();
        this.alertProvider.showPasswordResetMessage(email);
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  // Creating new user after signed up
  createNewUser(userId,name,username,email,description = "I'm available",provider,img="assets/images/profile.png"){
    let dateCreated= new Date();
    firebase.database().ref('accounts/'+userId).set({dateCreated,username,name,userId,email,description,provider,img});
  }

}
