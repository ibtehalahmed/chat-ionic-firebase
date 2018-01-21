import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DataProvider } from '../providers/data';
import { TranslateService } from '@ngx-translate/core';
//Pages
import { LoginPage } from '../pages/login/login';
import * as firebase from 'firebase';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = LoginPage;

  constructor(platform: Platform,
              dataProvider: DataProvider,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public translate: TranslateService) {

    platform.ready().then(() => {

      translate.addLangs(["en", "ar"]);
      translate.setDefaultLang('en');

      let browserLang = translate.getBrowserLang();
      translate.use(browserLang.match(/en/) ? browserLang : 'en');
      if(browserLang == 'ar')
      {
        platform.setDir('rtl', true);
        platform.setDir('ltr', false);
      }
      else
      {
        platform.setDir('ltr', true);
        platform.setDir('rtl', false);
      }
      statusBar.styleDefault();
      splashScreen.hide();
      platform.pause.subscribe(()=>{
        if(firebase.auth().currentUser)
          firebase.database().ref('accounts/'+firebase.auth().currentUser.uid).update({'online': false});
      });
      platform.resume.subscribe(()=>{
        if(firebase.auth().currentUser && localStorage.getItem('showOnline') == 'true')
          firebase.database().ref('accounts/'+firebase.auth().currentUser.uid).update({'online': true});
      })
    });
  }
}
